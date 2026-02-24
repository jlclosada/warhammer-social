from rest_framework import serializers
from django.utils.text import slugify
from .models import (
    GameSystem, Faction, CatalogMiniature, Tag,
    Collection, Miniature, MiniatureImage,
    Follow, Like, Save, Comment, CommentLike,
    Notification, Achievement, UserAchievement,
)


# ───────── Tags ─────────

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']
        read_only_fields = ['id', 'slug']

    def create(self, validated_data):
        validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)


# ───────── Game Systems ─────────

class GameSystemSerializer(serializers.ModelSerializer):
    faction_count = serializers.SerializerMethodField()

    class Meta:
        model = GameSystem
        fields = ['id', 'name', 'slug', 'description', 'logo', 'is_active', 'faction_count']

    def get_faction_count(self, obj):
        return obj.factions.filter(is_active=True).count()


# ───────── Factions ─────────

class FactionSerializer(serializers.ModelSerializer):
    game_system_name = serializers.CharField(source='game_system.name', read_only=True)

    class Meta:
        model = Faction
        fields = [
            'id', 'name', 'slug', 'category', 'description',
            'icon', 'game_system', 'game_system_name', 'is_active',
        ]


# ───────── Catalog Miniatures ─────────

class CatalogMiniatureSerializer(serializers.ModelSerializer):
    """Read serializer — includes tags and faction info."""
    faction_name = serializers.CharField(source='faction.name', read_only=True)
    game_system_name = serializers.SerializerMethodField()
    faction_category = serializers.CharField(source='faction.category', read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = CatalogMiniature
        fields = [
            'id', 'name', 'name_es', 'slug', 'unit_type', 'default_points',
            'description', 'image', 'faction', 'faction_name',
            'game_system_name', 'faction_category',
            'tags', 'is_active', 'created_at', 'updated_at',
        ]

    def get_game_system_name(self, obj):
        return obj.faction.game_system.name if obj.faction else None


class CatalogMiniatureWriteSerializer(serializers.ModelSerializer):
    """Write serializer — accepts tag names (creates if not exist)."""
    tags = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=False,
    )

    class Meta:
        model = CatalogMiniature
        fields = [
            'faction', 'name', 'name_es', 'unit_type', 'default_points',
            'description', 'image', 'tags', 'is_active',
        ]

    def to_representation(self, instance):
        """Use the read serializer for the response."""
        return CatalogMiniatureSerializer(instance, context=self.context).data

    def _resolve_tags(self, tag_names):
        """Get or create tags from a list of names."""
        tags = []
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(
                slug=slugify(name),
                defaults={'name': name},
            )
            tags.append(tag)
        return tags

    def create(self, validated_data):
        tag_names = validated_data.pop('tags', [])
        validated_data['slug'] = slugify(validated_data['name'])
        miniature = CatalogMiniature.objects.create(**validated_data)
        if tag_names:
            miniature.tags.set(self._resolve_tags(tag_names))
        # Auto-add faction and category as tags
        self._auto_tags(miniature)
        return miniature

    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tags', None)
        if 'name' in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        instance = super().update(instance, validated_data)
        if tag_names is not None:
            instance.tags.set(self._resolve_tags(tag_names))
            self._auto_tags(instance)
        return instance

    def _auto_tags(self, miniature):
        """Auto-add faction name and category as tags."""
        auto_names = [
            miniature.faction.name,
            miniature.faction.category.capitalize(),
            miniature.faction.game_system.name,
        ]
        if miniature.unit_type:
            auto_names.append(miniature.unit_type)
        for name in auto_names:
            tag, _ = Tag.objects.get_or_create(
                slug=slugify(name),
                defaults={'name': name},
            )
            miniature.tags.add(tag)


# ───────── Miniature Images ─────────

class MiniatureImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MiniatureImage
        fields = ['id', 'image', 'caption', 'is_primary', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


# ───────── User Miniatures (in collection) ─────────

class MiniatureSerializer(serializers.ModelSerializer):
    images = MiniatureImageSerializer(many=True, read_only=True)
    catalog_miniature_name = serializers.CharField(
        source='catalog_miniature.name', read_only=True, default=None,
    )
    paint_status_display = serializers.CharField(
        source='get_paint_status_display', read_only=True,
    )

    class Meta:
        model = Miniature
        fields = [
            'id', 'collection', 'catalog_miniature', 'catalog_miniature_name',
            'name', 'description', 'quantity', 'paint_status', 'paint_status_display',
            'points_cost', 'painting_hours', 'notes', 'is_public', 'images',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        collection = data.get('collection') or self.instance.collection
        catalog_mini = data.get('catalog_miniature')
        if catalog_mini and catalog_mini.faction != collection.faction:
            raise serializers.ValidationError({
                'catalog_miniature': 'This miniature does not belong to the collection\'s faction.',
            })
        return data


class MiniatureCreateSerializer(serializers.ModelSerializer):
    """Handles creation with image uploads."""
    images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False,
    )

    class Meta:
        model = Miniature
        fields = [
            'catalog_miniature', 'name', 'description', 'quantity',
            'paint_status', 'points_cost', 'painting_hours', 'notes', 'is_public', 'images',
        ]

    def validate(self, data):
        collection = self.context.get('collection')
        catalog_mini = data.get('catalog_miniature')
        if catalog_mini and collection and catalog_mini.faction != collection.faction:
            raise serializers.ValidationError({
                'catalog_miniature': 'This miniature does not belong to the collection\'s faction.',
            })
        return data

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        collection = self.context['collection']
        miniature = Miniature.objects.create(collection=collection, **validated_data)
        for i, image in enumerate(images_data):
            MiniatureImage.objects.create(
                miniature=miniature,
                image=image,
                is_primary=(i == 0),
            )
        return miniature


# ───────── Collections ─────────

class CollectionListSerializer(serializers.ModelSerializer):
    game_system_name = serializers.CharField(source='game_system.name', read_only=True)
    faction_name = serializers.CharField(source='faction.name', read_only=True)
    faction_category = serializers.CharField(source='faction.category', read_only=True)
    miniature_count = serializers.ReadOnlyField()
    total_points = serializers.ReadOnlyField()
    paint_progress = serializers.ReadOnlyField()
    owner_username = serializers.CharField(source='user.username', read_only=True)
    owner_avatar = serializers.ImageField(source='user.avatar', read_only=True)

    class Meta:
        model = Collection
        fields = [
            'id', 'name', 'description', 'game_system', 'game_system_name',
            'faction', 'faction_name', 'faction_category',
            'is_public', 'cover_image', 'banner_image',
            'miniature_count', 'total_points', 'paint_progress',
            'owner_username', 'owner_avatar',
            'created_at', 'updated_at',
        ]


class CollectionDetailSerializer(CollectionListSerializer):
    miniatures = MiniatureSerializer(many=True, read_only=True)

    class Meta(CollectionListSerializer.Meta):
        fields = CollectionListSerializer.Meta.fields + ['miniatures']


class CollectionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ['name', 'description', 'game_system', 'faction', 'is_public', 'cover_image', 'banner_image']

    def validate(self, data):
        game_system = data.get('game_system')
        faction = data.get('faction')
        if faction and game_system and faction.game_system != game_system:
            raise serializers.ValidationError({
                'faction': 'This faction does not belong to the selected game system.',
            })
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# ───────── Social ─────────

class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'username', 'avatar', 'text', 'like_count', 'is_liked', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class FeedMiniatureSerializer(serializers.ModelSerializer):
    """Miniature card for the public feed."""
    images = MiniatureImageSerializer(many=True, read_only=True)
    owner_username = serializers.CharField(source='collection.user.username', read_only=True)
    owner_avatar = serializers.ImageField(source='collection.user.avatar', read_only=True)
    owner_id = serializers.UUIDField(source='collection.user.id', read_only=True)
    collection_name = serializers.CharField(source='collection.name', read_only=True)
    faction_name = serializers.CharField(source='collection.faction.name', read_only=True)
    game_system_name = serializers.SerializerMethodField()
    paint_status_display = serializers.CharField(source='get_paint_status_display', read_only=True)
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    save_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = Miniature
        fields = [
            'id', 'name', 'description', 'quantity', 'paint_status',
            'paint_status_display', 'points_cost', 'painting_hours',
            'images', 'owner_username', 'owner_avatar', 'owner_id',
            'collection_name', 'faction_name', 'game_system_name',
            'like_count', 'comment_count', 'save_count',
            'is_liked', 'is_saved', 'is_following',
            'created_at',
        ]

    def get_game_system_name(self, obj):
        return obj.collection.game_system.name

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_save_count(self, obj):
        return obj.saves.count()

    def get_is_liked(self, obj):
        user = self.context.get('request')
        if user and hasattr(user, 'user') and user.user.is_authenticated:
            return obj.likes.filter(user=user.user).exists()
        return False

    def get_is_saved(self, obj):
        user = self.context.get('request')
        if user and hasattr(user, 'user') and user.user.is_authenticated:
            return obj.saves.filter(user=user.user).exists()
        return False

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            owner = obj.collection.user
            if owner == request.user:
                return False
            return Follow.objects.filter(
                follower=request.user, following=owner,
            ).exists()
        return False


class FollowSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='following.username', read_only=True)
    avatar = serializers.ImageField(source='following.avatar', read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'following', 'username', 'avatar', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserProfileSerializer(serializers.Serializer):
    """Public profile info."""
    id = serializers.UUIDField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    avatar = serializers.ImageField()
    bio = serializers.CharField()
    collection_count = serializers.IntegerField()
    follower_count = serializers.IntegerField()
    following_count = serializers.IntegerField()
    is_following = serializers.BooleanField()


# ───────── Notifications ─────────

class NotificationSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source='actor.username', read_only=True, default=None)
    actor_id = serializers.UUIDField(source='actor.id', read_only=True, default=None)
    actor_avatar = serializers.SerializerMethodField()
    miniature_id = serializers.UUIDField(source='miniature.id', read_only=True, default=None)
    miniature_name = serializers.CharField(source='miniature.name', read_only=True, default=None)
    miniature_image = serializers.SerializerMethodField()
    achievement_name = serializers.CharField(source='achievement.name', read_only=True, default=None)
    achievement_icon = serializers.CharField(source='achievement.icon', read_only=True, default=None)
    achievement_rarity = serializers.CharField(source='achievement.rarity', read_only=True, default=None)

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'message', 'is_read', 'created_at',
            'actor_username', 'actor_id', 'actor_avatar',
            'miniature_id', 'miniature_name', 'miniature_image',
            'achievement_name', 'achievement_icon', 'achievement_rarity',
        ]

    def get_actor_avatar(self, obj):
        if obj.actor and obj.actor.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.actor.avatar.url)
        return None

    def get_miniature_image(self, obj):
        if obj.miniature:
            img = obj.miniature.images.filter(is_primary=True).first() or obj.miniature.images.first()
            if img:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(img.image.url)
        return None


# ───────── Achievements ─────────

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = [
            'id', 'key', 'name', 'description', 'icon',
            'category', 'rarity', 'threshold', 'points', 'is_active',
        ]


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)

    class Meta:
        model = UserAchievement
        fields = ['id', 'achievement', 'unlocked_at']


