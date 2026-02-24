from django.contrib import admin
from .models import (
    GameSystem, Faction, CatalogMiniature, Tag,
    Collection, Miniature, MiniatureImage,
    Follow, Like, Save, Comment, CommentLike,
    Notification, Achievement, UserAchievement,
)


@admin.register(GameSystem)
class GameSystemAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created_at')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Faction)
class FactionAdmin(admin.ModelAdmin):
    list_display = ('name', 'game_system', 'category', 'is_active')
    list_filter = ('game_system', 'category', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(CatalogMiniature)
class CatalogMiniatureAdmin(admin.ModelAdmin):
    list_display = ('name', 'name_es', 'faction', 'unit_type', 'default_points', 'is_active')
    list_filter = ('faction__game_system', 'faction', 'unit_type', 'is_active', 'tags')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'name_es', 'tags__name')
    filter_horizontal = ('tags',)
    readonly_fields = ('created_at', 'updated_at')


class MiniatureImageInline(admin.TabularInline):
    model = MiniatureImage
    extra = 0


class MiniatureInline(admin.TabularInline):
    model = Miniature
    extra = 0
    show_change_link = True


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'game_system', 'faction', 'is_public', 'created_at')
    list_filter = ('game_system', 'faction__category', 'is_public')
    search_fields = ('name', 'user__username')
    inlines = [MiniatureInline]


@admin.register(Miniature)
class MiniatureAdmin(admin.ModelAdmin):
    list_display = ('name', 'collection', 'paint_status', 'quantity', 'is_public', 'painting_hours')
    list_filter = ('paint_status', 'is_public', 'collection__game_system')
    search_fields = ('name',)
    inlines = [MiniatureImageInline]


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ('follower', 'following', 'created_at')
    search_fields = ('follower__username', 'following__username')


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'miniature', 'created_at')


@admin.register(Save)
class SaveAdmin(admin.ModelAdmin):
    list_display = ('user', 'miniature', 'created_at')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'miniature', 'text', 'created_at')
    search_fields = ('text', 'user__username')


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'comment', 'created_at')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'notification_type', 'actor', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')
    search_fields = ('recipient__username', 'actor__username', 'message')


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name', 'key', 'category', 'rarity', 'threshold', 'points', 'is_active')
    list_filter = ('category', 'rarity', 'is_active')
    search_fields = ('name', 'key')


class UserAchievementInline(admin.TabularInline):
    model = UserAchievement
    extra = 0
    readonly_fields = ('achievement', 'unlocked_at')


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'unlocked_at')
    list_filter = ('achievement__category', 'achievement__rarity')
    search_fields = ('user__username', 'achievement__name')


