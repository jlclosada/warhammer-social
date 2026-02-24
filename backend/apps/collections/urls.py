from django.urls import path
from .views import (
    GameSystemListView,
    FactionListView,
    TagListCreateView,
    CatalogMiniatureListCreateView,
    CatalogMiniatureDetailView,
    CatalogSearchView,
    CollectionListCreateView,
    CollectionDetailView,
    MiniatureListCreateView,
    MiniatureDetailView,
    MiniatureImageUploadView,
    # Feed
    FeedForYouView,
    FeedFollowingView,
    # Social
    LikeToggleView,
    SaveToggleView,
    CommentListCreateView,
    CommentDeleteView,
    CommentLikeToggleView,
    FollowToggleView,
    UserProfileView,
    MySavedView,
    # Notifications
    NotificationListView,
    NotificationReadView,
    NotificationCountView,
    # Achievements
    AchievementListView,
    CheckAchievementsView,
)

urlpatterns = [
    # Reference data
    path('game-systems/', GameSystemListView.as_view(), name='game-systems'),
    path('factions/', FactionListView.as_view(), name='factions'),
    path('tags/', TagListCreateView.as_view(), name='tags'),

    # Catalog — full CRUD + search
    path('catalog/', CatalogMiniatureListCreateView.as_view(), name='catalog'),
    path('catalog/search/', CatalogSearchView.as_view(), name='catalog-search'),
    path('catalog/<uuid:pk>/', CatalogMiniatureDetailView.as_view(), name='catalog-detail'),

    # Collections
    path('', CollectionListCreateView.as_view(), name='collections'),
    path('<uuid:pk>/', CollectionDetailView.as_view(), name='collection-detail'),

    # Miniatures within a collection
    path('<uuid:collection_pk>/miniatures/', MiniatureListCreateView.as_view(), name='miniatures'),
    path('<uuid:collection_pk>/miniatures/<uuid:pk>/', MiniatureDetailView.as_view(), name='miniature-detail'),
    path('<uuid:collection_pk>/miniatures/<uuid:pk>/images/', MiniatureImageUploadView.as_view(), name='miniature-images'),

    # Feed
    path('feed/for-you/', FeedForYouView.as_view(), name='feed-for-you'),
    path('feed/following/', FeedFollowingView.as_view(), name='feed-following'),

    # Social
    path('social/like/<uuid:miniature_pk>/', LikeToggleView.as_view(), name='like-toggle'),
    path('social/save/<uuid:miniature_pk>/', SaveToggleView.as_view(), name='save-toggle'),
    path('social/comments/<uuid:miniature_pk>/', CommentListCreateView.as_view(), name='comments'),
    path('social/comments/<uuid:miniature_pk>/<uuid:pk>/', CommentDeleteView.as_view(), name='comment-delete'),
    path('social/comment-like/<uuid:comment_pk>/', CommentLikeToggleView.as_view(), name='comment-like-toggle'),
    path('social/follow/<uuid:user_pk>/', FollowToggleView.as_view(), name='follow-toggle'),
    path('social/profile/<str:username>/', UserProfileView.as_view(), name='user-profile'),
    path('social/saved/', MySavedView.as_view(), name='my-saved'),

    # Notifications
    path('social/notifications/', NotificationListView.as_view(), name='notifications'),
    path('social/notifications/read/', NotificationReadView.as_view(), name='notifications-read'),
    path('social/notifications/unread-count/', NotificationCountView.as_view(), name='notifications-unread'),

    # Achievements
    path('social/achievements/', AchievementListView.as_view(), name='achievements'),
    path('social/achievements/check/', CheckAchievementsView.as_view(), name='achievements-check'),
]

