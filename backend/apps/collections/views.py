from rest_framework import generics, permissions, status, parsers, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.contrib.auth import get_user_model

from .models import (
    GameSystem, Faction, CatalogMiniature, Tag,
    Collection, Miniature, MiniatureImage,
    Follow, Like, Save, Comment, CommentLike,
    Notification, Achievement, UserAchievement,
)
from .serializers import (
    GameSystemSerializer, FactionSerializer,
    CatalogMiniatureSerializer, CatalogMiniatureWriteSerializer,
    TagSerializer,
    CollectionListSerializer, CollectionDetailSerializer, CollectionCreateSerializer,
    MiniatureSerializer, MiniatureCreateSerializer, MiniatureImageSerializer,
    FeedMiniatureSerializer, CommentSerializer, FollowSerializer, UserProfileSerializer,
    NotificationSerializer, AchievementSerializer, UserAchievementSerializer,
)
from .services import create_notification, check_achievements
from apps.users.permissions import IsAdminRole

User = get_user_model()


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow read access to any authenticated user, write access only to admins."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class NoPagination(PageNumberPagination):
    """Disable pagination for reference data endpoints."""
    page_size = None


class FeedPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 50


# ═══════════════════════════════════════════
# REFERENCE DATA
# ═══════════════════════════════════════════

class GameSystemListView(generics.ListAPIView):
    """List all active game systems."""
    queryset = GameSystem.objects.filter(is_active=True)
    serializer_class = GameSystemSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = NoPagination


class FactionListView(generics.ListAPIView):
    """List factions for a game system, optionally filtered by category."""
    serializer_class = FactionSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = NoPagination

    def get_queryset(self):
        qs = Faction.objects.filter(is_active=True)
        game_system_id = self.request.query_params.get('game_system')
        category = self.request.query_params.get('category')
        if game_system_id:
            qs = qs.filter(game_system_id=game_system_id)
        if category:
            qs = qs.filter(category=category)
        return qs.select_related('game_system')


class TagListCreateView(generics.ListCreateAPIView):
    """List all tags or create a new one."""
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NoPagination


# ═══════════════════════════════════════════
# CATALOG — full CRUD + search
# ═══════════════════════════════════════════

class CatalogMiniatureListCreateView(generics.ListCreateAPIView):
    """
    GET  — List catalog miniatures. Supports filters:
           ?faction=<uuid>  ?unit_type=<str>  ?tag=<slug>  ?search=<str>
    POST — Create a new catalog miniature (admin only).
    """
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    pagination_class = NoPagination

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CatalogMiniatureWriteSerializer
        return CatalogMiniatureSerializer

    def get_queryset(self):
        qs = CatalogMiniature.objects.filter(is_active=True)
        params = self.request.query_params

        faction_id = params.get('faction')
        unit_type = params.get('unit_type')
        tag = params.get('tag')
        search = params.get('search')

        if faction_id:
            qs = qs.filter(faction_id=faction_id)
        if unit_type:
            qs = qs.filter(unit_type__iexact=unit_type)
        if tag:
            qs = qs.filter(tags__slug=tag)
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(name_es__icontains=search)
                | Q(tags__name__icontains=search)
                | Q(faction__name__icontains=search)
                | Q(description__icontains=search)
            ).distinct()

        return qs.select_related('faction__game_system').prefetch_related('tags')


class CatalogMiniatureDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET / PUT / PATCH / DELETE a single catalog miniature (write = admin only)."""
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CatalogMiniatureWriteSerializer
        return CatalogMiniatureSerializer

    def get_queryset(self):
        return (
            CatalogMiniature.objects
            .select_related('faction__game_system')
            .prefetch_related('tags')
        )


class CatalogSearchView(APIView):
    """
    Global search across the entire catalog.
    GET /catalog/search/?q=<query>
    Searches by name, name_es, tags, faction, unit_type.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if not q or len(q) < 2:
            return Response([])

        miniatures = (
            CatalogMiniature.objects
            .filter(is_active=True)
            .filter(
                Q(name__icontains=q)
                | Q(name_es__icontains=q)
                | Q(tags__name__icontains=q)
                | Q(tags__slug__icontains=q)
                | Q(faction__name__icontains=q)
                | Q(faction__category__icontains=q)
                | Q(unit_type__icontains=q)
                | Q(faction__game_system__name__icontains=q)
            )
            .distinct()
            .select_related('faction__game_system')
            .prefetch_related('tags')[:50]
        )

        serializer = CatalogMiniatureSerializer(miniatures, many=True)
        return Response(serializer.data)


# ═══════════════════════════════════════════
# COLLECTIONS
# ═══════════════════════════════════════════

class CollectionListCreateView(generics.ListCreateAPIView):
    """List user's collections or create a new one."""
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NoPagination

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CollectionCreateSerializer
        return CollectionListSerializer

    def get_queryset(self):
        return (
            Collection.objects
            .filter(user=self.request.user)
            .select_related('game_system', 'faction')
            .prefetch_related('miniatures')
        )

    def perform_create(self, serializer):
        serializer.save()
        check_achievements(self.request.user)


class CollectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a collection."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CollectionCreateSerializer
        return CollectionDetailSerializer

    def get_queryset(self):
        return (
            Collection.objects
            .filter(user=self.request.user)
            .select_related('game_system', 'faction')
            .prefetch_related('miniatures__images', 'miniatures__catalog_miniature')
        )


# ═══════════════════════════════════════════
# MINIATURES (within a collection)
# ═══════════════════════════════════════════

class MiniatureListCreateView(generics.ListCreateAPIView):
    """List miniatures in a collection or add new ones."""
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NoPagination
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_collection(self):
        return get_object_or_404(
            Collection, pk=self.kwargs['collection_pk'], user=self.request.user,
        )

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MiniatureCreateSerializer
        return MiniatureSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        if self.request.method == 'POST':
            ctx['collection'] = self.get_collection()
        return ctx

    def get_queryset(self):
        return (
            Miniature.objects
            .filter(collection__user=self.request.user, collection_id=self.kwargs['collection_pk'])
            .select_related('catalog_miniature')
            .prefetch_related('images')
        )

    def perform_create(self, serializer):
        serializer.save()
        check_achievements(self.request.user)


class MiniatureDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a miniature."""
    serializer_class = MiniatureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Miniature.objects
            .filter(
                collection__user=self.request.user,
                collection_id=self.kwargs['collection_pk'],
            )
            .select_related('catalog_miniature')
            .prefetch_related('images')
        )

    def perform_update(self, serializer):
        serializer.save()
        check_achievements(self.request.user)


class MiniatureImageUploadView(APIView):
    """Upload additional images to a miniature."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser]

    def post(self, request, collection_pk, pk):
        miniature = get_object_or_404(
            Miniature,
            pk=pk,
            collection_id=collection_pk,
            collection__user=request.user,
        )

        images = request.FILES.getlist('images')
        if not images:
            return Response(
                {'error': 'No images provided.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created = []
        has_primary = miniature.images.filter(is_primary=True).exists()
        for i, img in enumerate(images):
            obj = MiniatureImage.objects.create(
                miniature=miniature,
                image=img,
                caption=request.data.get('caption', ''),
                is_primary=(not has_primary and i == 0),
            )
            created.append(obj)

        serializer = MiniatureImageSerializer(created, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ═══════════════════════════════════════════
# FEED
# ═══════════════════════════════════════════

class FeedForYouView(generics.ListAPIView):
    """
    Public feed: all public miniatures, newest first.
    GET /feed/for-you/
    """
    serializer_class = FeedMiniatureSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = FeedPagination

    def get_queryset(self):
        return (
            Miniature.objects
            .filter(is_public=True, images__isnull=False)
            .distinct()
            .select_related(
                'collection__user',
                'collection__faction',
                'collection__game_system',
            )
            .prefetch_related('images', 'likes', 'comments', 'saves')
            .annotate(
                _like_count=Count('likes'),
            )
            .order_by('-created_at')
        )


class FeedFollowingView(generics.ListAPIView):
    """
    Following feed: public miniatures from users I follow.
    GET /feed/following/
    """
    serializer_class = FeedMiniatureSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = FeedPagination

    def get_queryset(self):
        following_ids = (
            Follow.objects
            .filter(follower=self.request.user)
            .values_list('following_id', flat=True)
        )
        return (
            Miniature.objects
            .filter(is_public=True, collection__user_id__in=following_ids, images__isnull=False)
            .distinct()
            .select_related(
                'collection__user',
                'collection__faction',
                'collection__game_system',
            )
            .prefetch_related('images', 'likes', 'comments', 'saves')
            .order_by('-created_at')
        )


# ═══════════════════════════════════════════
# SOCIAL ACTIONS
# ═══════════════════════════════════════════

class LikeToggleView(APIView):
    """Toggle like on a miniature. POST /social/like/<miniature_pk>/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, miniature_pk):
        miniature = get_object_or_404(Miniature, pk=miniature_pk, is_public=True)
        like, created = Like.objects.get_or_create(
            user=request.user, miniature=miniature,
        )
        if not created:
            like.delete()
            return Response({'liked': False, 'count': miniature.likes.count()})
        # Notification to miniature owner
        create_notification(
            recipient=miniature.collection.user,
            notification_type='like',
            actor=request.user,
            miniature=miniature,
            message=f'{request.user.username} liked your miniature "{miniature.name}"',
        )
        # Check achievements for both users
        check_achievements(miniature.collection.user)
        check_achievements(request.user)
        return Response({'liked': True, 'count': miniature.likes.count()}, status=status.HTTP_201_CREATED)


class SaveToggleView(APIView):
    """Toggle save/bookmark on a miniature. POST /social/save/<miniature_pk>/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, miniature_pk):
        miniature = get_object_or_404(Miniature, pk=miniature_pk, is_public=True)
        save, created = Save.objects.get_or_create(
            user=request.user, miniature=miniature,
        )
        if not created:
            save.delete()
            return Response({'saved': False, 'count': miniature.saves.count()})
        return Response({'saved': True, 'count': miniature.saves.count()}, status=status.HTTP_201_CREATED)


class CommentListCreateView(generics.ListCreateAPIView):
    """
    GET  — List comments for a miniature.
    POST — Add a comment.
    """
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NoPagination

    def get_queryset(self):
        return Comment.objects.filter(
            miniature_id=self.kwargs['miniature_pk'],
            miniature__is_public=True,
        ).select_related('user')

    def perform_create(self, serializer):
        miniature = get_object_or_404(
            Miniature, pk=self.kwargs['miniature_pk'], is_public=True,
        )
        comment = serializer.save(user=self.request.user, miniature=miniature)
        # Notification to miniature owner
        create_notification(
            recipient=miniature.collection.user,
            notification_type='comment',
            actor=self.request.user,
            miniature=miniature,
            message=f'{self.request.user.username} commented on "{miniature.name}": {comment.text[:80]}',
        )
        check_achievements(self.request.user)


class CommentDeleteView(generics.DestroyAPIView):
    """Delete own comment."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(user=self.request.user)


class CommentLikeToggleView(APIView):
    """Toggle like on a comment. POST /social/comment-like/<comment_pk>/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, comment_pk):
        comment = get_object_or_404(Comment, pk=comment_pk)
        cl, created = CommentLike.objects.get_or_create(
            user=request.user, comment=comment,
        )
        if not created:
            cl.delete()
            return Response({'liked': False, 'count': comment.likes.count()})
        # Notify comment author
        if comment.user != request.user:
            create_notification(
                recipient=comment.user,
                notification_type='like',
                actor=request.user,
                miniature=comment.miniature,
                message=f'{request.user.username} liked your comment on "{comment.miniature.name}"',
            )
        return Response({'liked': True, 'count': comment.likes.count()}, status=status.HTTP_201_CREATED)


class FollowToggleView(APIView):
    """Toggle follow on a user. POST /social/follow/<user_pk>/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_pk):
        target = get_object_or_404(User, pk=user_pk)
        if target == request.user:
            return Response({'error': 'Cannot follow yourself.'}, status=400)
        follow, created = Follow.objects.get_or_create(
            follower=request.user, following=target,
        )
        if not created:
            follow.delete()
            return Response({'following': False})
        # Notification
        create_notification(
            recipient=target,
            notification_type='follow',
            actor=request.user,
            message=f'{request.user.username} started following you',
        )
        check_achievements(target)
        check_achievements(request.user)
        return Response({'following': True}, status=status.HTTP_201_CREATED)


class UserProfileView(APIView):
    """GET /social/profile/<username>/ — Public profile with collections and posts."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        is_self = request.user == user
        is_following = Follow.objects.filter(
            follower=request.user, following=user,
        ).exists() if not is_self else False

        data = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'avatar': request.build_absolute_uri(user.avatar.url) if user.avatar else None,
            'bio': user.bio,
            'date_joined': user.date_joined,
            'is_self': is_self,
            'is_following': is_following,
            'follower_count': user.followers.count(),
            'following_count': user.following.count(),
        }

        # Collections (public for others, all for self)
        coll_qs = Collection.objects.filter(user=user)
        if not is_self:
            coll_qs = coll_qs.filter(is_public=True)
        collections = (
            coll_qs
            .select_related('game_system', 'faction')
            .prefetch_related('miniatures')
        )
        data['collection_count'] = collections.count()
        data['collections'] = CollectionListSerializer(collections, many=True).data

        # Public miniatures (posts) — all public minis with images from this user
        public_minis = (
            Miniature.objects
            .filter(is_public=True, collection__user=user, images__isnull=False)
            .distinct()
            .select_related(
                'collection__user', 'collection__faction', 'collection__game_system',
            )
            .prefetch_related('images', 'likes', 'comments', 'saves')
            .order_by('-created_at')
        )
        data['post_count'] = public_minis.count()
        data['posts'] = FeedMiniatureSerializer(
            public_minis, many=True, context={'request': request}
        ).data

        # Stats
        all_minis = Miniature.objects.filter(collection__user=user)
        data['total_miniatures'] = sum(m.quantity for m in all_minis) if is_self else None
        data['total_painted'] = sum(
            m.quantity for m in all_minis.filter(
                paint_status__in=['painted', 'based', 'display_ready']
            )
        ) if is_self else None

        # Followers / following lists (limited)
        data['followers'] = [
            {
                'id': f.follower.id,
                'username': f.follower.username,
                'avatar': request.build_absolute_uri(f.follower.avatar.url) if f.follower.avatar else None,
            }
            for f in Follow.objects.filter(following=user).select_related('follower')[:50]
        ]
        data['following_list'] = [
            {
                'id': f.following.id,
                'username': f.following.username,
                'avatar': request.build_absolute_uri(f.following.avatar.url) if f.following.avatar else None,
            }
            for f in Follow.objects.filter(follower=user).select_related('following')[:50]
        ]

        return Response(data)


class MySavedView(generics.ListAPIView):
    """GET /social/saved/ — My saved miniatures."""
    serializer_class = FeedMiniatureSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = FeedPagination

    def get_queryset(self):
        saved_ids = (
            Save.objects
            .filter(user=self.request.user)
            .values_list('miniature_id', flat=True)
        )
        return (
            Miniature.objects
            .filter(id__in=saved_ids, is_public=True)
            .select_related(
                'collection__user',
                'collection__faction',
                'collection__game_system',
            )
            .prefetch_related('images', 'likes', 'comments', 'saves')
            .order_by('-created_at')
        )


# ═══════════════════════════════════════════
# NOTIFICATIONS
# ════════════════════════════════════��══════

class NotificationListView(generics.ListAPIView):
    """GET /social/notifications/ — User notifications."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = FeedPagination

    def get_queryset(self):
        return (
            Notification.objects
            .filter(recipient=self.request.user)
            .select_related('actor', 'miniature', 'achievement')
            .prefetch_related('miniature__images')
            .order_by('-created_at')
        )


class NotificationReadView(APIView):
    """POST /social/notifications/read/ — Mark all as read."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        count = Notification.objects.filter(
            recipient=request.user, is_read=False,
        ).update(is_read=True)
        return Response({'marked_read': count})


class NotificationCountView(APIView):
    """GET /social/notifications/unread-count/ — Unread count."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            recipient=request.user, is_read=False,
        ).count()
        return Response({'count': count})


# ═══════════════════════════════════════════
# ACHIEVEMENTS
# ═══════════════════════════════════════════

class AchievementListView(APIView):
    """GET /social/achievements/ — All achievements with user progress."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from .services import seed_achievements
        seed_achievements()

        achievements = Achievement.objects.filter(is_active=True)
        unlocked_keys = set(
            UserAchievement.objects
            .filter(user=request.user)
            .values_list('achievement__key', flat=True)
        )
        unlocked_map = {
            ua.achievement_id: ua.unlocked_at
            for ua in UserAchievement.objects
            .filter(user=request.user)
            .select_related('achievement')
        }

        data = []
        for ach in achievements:
            data.append({
                'id': ach.id,
                'key': ach.key,
                'name': ach.name,
                'description': ach.description,
                'icon': ach.icon,
                'category': ach.category,
                'rarity': ach.rarity,
                'threshold': ach.threshold,
                'points': ach.points,
                'unlocked': ach.key in unlocked_keys,
                'unlocked_at': unlocked_map.get(ach.id),
            })

        total_points = sum(d['points'] for d in data if d['unlocked'])
        return Response({
            'achievements': data,
            'total_points': total_points,
            'unlocked_count': len([d for d in data if d['unlocked']]),
            'total_count': len(data),
        })


class CheckAchievementsView(APIView):
    """POST /social/achievements/check/ — Force-check achievements."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        newly = check_achievements(request.user)
        return Response({
            'newly_unlocked': [
                {'key': a.key, 'name': a.name, 'rarity': a.rarity, 'points': a.points}
                for a in newly
            ],
        })

