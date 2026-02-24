"""
Achievement & Notification service.
Call check_achievements(user) after any relevant action.
Call create_notification(...) to push a notification.
"""
from django.db.models import Sum

from .models import (
    Achievement, UserAchievement, Notification,
    Collection, Miniature, Follow, Like, Comment,
)


# ── Achievement definitions (seed data) ──────────────────────────
ACHIEVEMENT_DEFS = [
    # ── Painting ──
    {'key': 'first_paint', 'name': 'First Brushstroke', 'description': 'Paint your first miniature.', 'icon': 'paintbrush', 'category': 'painting', 'rarity': 'common', 'threshold': 1, 'points': 10},
    {'key': 'paint_10', 'name': 'Apprentice Painter', 'description': 'Paint 10 miniatures.', 'icon': 'paintbrush', 'category': 'painting', 'rarity': 'uncommon', 'threshold': 10, 'points': 25},
    {'key': 'paint_50', 'name': 'Journeyman Painter', 'description': 'Paint 50 miniatures.', 'icon': 'paintbrush', 'category': 'painting', 'rarity': 'rare', 'threshold': 50, 'points': 50},
    {'key': 'paint_100', 'name': 'Master Painter', 'description': 'Paint 100 miniatures.', 'icon': 'paintbrush', 'category': 'painting', 'rarity': 'epic', 'threshold': 100, 'points': 100},
    {'key': 'paint_500', 'name': 'Legendary Artisan', 'description': 'Paint 500 miniatures.', 'icon': 'paintbrush', 'category': 'painting', 'rarity': 'legendary', 'threshold': 500, 'points': 250},
    {'key': 'hours_10', 'name': 'Dedicated Hobbyist', 'description': 'Log 10 hours of painting.', 'icon': 'clock', 'category': 'painting', 'rarity': 'common', 'threshold': 10, 'points': 15},
    {'key': 'hours_100', 'name': 'The Grinder', 'description': 'Log 100 hours of painting.', 'icon': 'clock', 'category': 'painting', 'rarity': 'rare', 'threshold': 100, 'points': 75},
    {'key': 'hours_500', 'name': 'Paint Never Sleeps', 'description': 'Log 500 hours of painting.', 'icon': 'clock', 'category': 'painting', 'rarity': 'legendary', 'threshold': 500, 'points': 200},
    {'key': 'display_ready_1', 'name': 'Display Case', 'description': 'Have 1 display-ready miniature.', 'icon': 'star', 'category': 'painting', 'rarity': 'uncommon', 'threshold': 1, 'points': 20},
    {'key': 'display_ready_10', 'name': 'Gallery Owner', 'description': 'Have 10 display-ready miniatures.', 'icon': 'star', 'category': 'painting', 'rarity': 'epic', 'threshold': 10, 'points': 100},

    # ── Collecting ──
    {'key': 'first_collection', 'name': 'The Beginning', 'description': 'Create your first collection.', 'icon': 'folder', 'category': 'collecting', 'rarity': 'common', 'threshold': 1, 'points': 10},
    {'key': 'collections_3', 'name': 'Multi-Army General', 'description': 'Create 3 collections.', 'icon': 'folder', 'category': 'collecting', 'rarity': 'uncommon', 'threshold': 3, 'points': 25},
    {'key': 'collections_5', 'name': 'Warlord', 'description': 'Create 5 collections.', 'icon': 'folder', 'category': 'collecting', 'rarity': 'rare', 'threshold': 5, 'points': 50},
    {'key': 'minis_25', 'name': 'Growing Army', 'description': 'Own 25 miniatures across all collections.', 'icon': 'swords', 'category': 'collecting', 'rarity': 'common', 'threshold': 25, 'points': 15},
    {'key': 'minis_100', 'name': 'Battalion Commander', 'description': 'Own 100 miniatures.', 'icon': 'swords', 'category': 'collecting', 'rarity': 'rare', 'threshold': 100, 'points': 50},
    {'key': 'minis_500', 'name': 'Forge Master', 'description': 'Own 500 miniatures.', 'icon': 'swords', 'category': 'collecting', 'rarity': 'legendary', 'threshold': 500, 'points': 200},
    {'key': 'points_1000', 'name': '1K Army', 'description': 'Have a collection with 1000+ points.', 'icon': 'target', 'category': 'collecting', 'rarity': 'uncommon', 'threshold': 1000, 'points': 30},
    {'key': 'points_2000', 'name': '2K Army', 'description': 'Have a collection with 2000+ points.', 'icon': 'target', 'category': 'collecting', 'rarity': 'rare', 'threshold': 2000, 'points': 50},

    # ── Social ──
    {'key': 'first_post', 'name': 'Going Public', 'description': 'Publish your first miniature to Explore.', 'icon': 'globe', 'category': 'social', 'rarity': 'common', 'threshold': 1, 'points': 10},
    {'key': 'posts_10', 'name': 'Content Creator', 'description': 'Publish 10 miniatures.', 'icon': 'globe', 'category': 'social', 'rarity': 'uncommon', 'threshold': 10, 'points': 25},
    {'key': 'posts_50', 'name': 'Influencer', 'description': 'Publish 50 miniatures.', 'icon': 'globe', 'category': 'social', 'rarity': 'epic', 'threshold': 50, 'points': 100},
    {'key': 'first_like', 'name': 'Appreciated', 'description': 'Receive your first like.', 'icon': 'heart', 'category': 'social', 'rarity': 'common', 'threshold': 1, 'points': 10},
    {'key': 'likes_50', 'name': 'Popular', 'description': 'Receive 50 likes on your miniatures.', 'icon': 'heart', 'category': 'social', 'rarity': 'uncommon', 'threshold': 50, 'points': 30},
    {'key': 'likes_500', 'name': 'Fan Favorite', 'description': 'Receive 500 likes on your miniatures.', 'icon': 'heart', 'category': 'social', 'rarity': 'epic', 'threshold': 500, 'points': 100},
    {'key': 'first_comment', 'name': 'Conversation Starter', 'description': 'Leave your first comment.', 'icon': 'message-circle', 'category': 'social', 'rarity': 'common', 'threshold': 1, 'points': 5},
    {'key': 'comments_50', 'name': 'Community Pillar', 'description': 'Leave 50 comments.', 'icon': 'message-circle', 'category': 'social', 'rarity': 'uncommon', 'threshold': 50, 'points': 30},
    {'key': 'followers_5', 'name': 'Rising Star', 'description': 'Get 5 followers.', 'icon': 'users', 'category': 'social', 'rarity': 'common', 'threshold': 5, 'points': 15},
    {'key': 'followers_25', 'name': 'Community Leader', 'description': 'Get 25 followers.', 'icon': 'users', 'category': 'social', 'rarity': 'rare', 'threshold': 25, 'points': 50},
    {'key': 'followers_100', 'name': 'Celebrity', 'description': 'Get 100 followers.', 'icon': 'users', 'category': 'social', 'rarity': 'epic', 'threshold': 100, 'points': 100},
    {'key': 'following_10', 'name': 'Networker', 'description': 'Follow 10 users.', 'icon': 'user-plus', 'category': 'social', 'rarity': 'common', 'threshold': 10, 'points': 10},

    # ── Explorer ──
    {'key': 'multi_faction', 'name': 'Faction Hopper', 'description': 'Collect from 3 different factions.', 'icon': 'compass', 'category': 'explorer', 'rarity': 'uncommon', 'threshold': 3, 'points': 25},
    {'key': 'multi_game', 'name': 'System Explorer', 'description': 'Collect from 2 different game systems.', 'icon': 'compass', 'category': 'explorer', 'rarity': 'rare', 'threshold': 2, 'points': 40},
    {'key': 'full_paint_collection', 'name': 'Fully Painted', 'description': 'Have a 100% painted collection.', 'icon': 'check-circle', 'category': 'explorer', 'rarity': 'rare', 'threshold': 1, 'points': 75},
]


def seed_achievements():
    """Create all achievement definitions in the DB."""
    created = 0
    for defn in ACHIEVEMENT_DEFS:
        _, was_created = Achievement.objects.get_or_create(
            key=defn['key'],
            defaults=defn,
        )
        if was_created:
            created += 1
    return created


def create_notification(recipient, notification_type, actor=None, miniature=None, achievement=None, message=''):
    """Create a notification. Skips if recipient == actor."""
    if actor and actor == recipient:
        return None
    return Notification.objects.create(
        recipient=recipient,
        actor=actor,
        notification_type=notification_type,
        miniature=miniature,
        achievement=achievement,
        message=message,
    )


def check_achievements(user):
    """Check and unlock any new achievements for the user. Returns list of newly unlocked."""
    # Make sure achievements exist
    if not Achievement.objects.exists():
        seed_achievements()

    already = set(
        UserAchievement.objects
        .filter(user=user)
        .values_list('achievement__key', flat=True)
    )
    newly_unlocked = []

    # Gather user stats
    user_minis = Miniature.objects.filter(collection__user=user)
    painted_count = sum(
        m.quantity for m in user_minis.filter(
            paint_status__in=['painted', 'based', 'display_ready']
        )
    )
    display_ready_count = sum(
        m.quantity for m in user_minis.filter(paint_status='display_ready')
    )
    total_hours = user_minis.aggregate(
        total=Sum('painting_hours')
    )['total'] or 0
    total_minis = sum(m.quantity for m in user_minis)
    collection_count = Collection.objects.filter(user=user).count()
    public_count = user_minis.filter(is_public=True).count()
    total_likes_received = Like.objects.filter(
        miniature__collection__user=user
    ).count()
    comments_made = Comment.objects.filter(user=user).count()
    follower_count = Follow.objects.filter(following=user).count()
    following_count = Follow.objects.filter(follower=user).count()

    # Collections stats
    collections = Collection.objects.filter(user=user).select_related('game_system', 'faction')
    faction_ids = set(c.faction_id for c in collections if c.faction_id)
    game_system_ids = set(c.game_system_id for c in collections if c.game_system_id)

    # Max points in a single collection
    max_points = 0
    has_fully_painted = False
    for c in collections:
        minis = Miniature.objects.filter(collection=c)
        pts = sum(m.points_cost * m.quantity for m in minis)
        if pts > max_points:
            max_points = pts
        # Check fully painted
        if minis.exists():
            all_painted = all(
                m.paint_status in ('painted', 'based', 'display_ready')
                for m in minis
            )
            if all_painted:
                has_fully_painted = True

    # Check each achievement
    checks = {
        # Painting
        'first_paint': painted_count,
        'paint_10': painted_count,
        'paint_50': painted_count,
        'paint_100': painted_count,
        'paint_500': painted_count,
        'hours_10': float(total_hours),
        'hours_100': float(total_hours),
        'hours_500': float(total_hours),
        'display_ready_1': display_ready_count,
        'display_ready_10': display_ready_count,
        # Collecting
        'first_collection': collection_count,
        'collections_3': collection_count,
        'collections_5': collection_count,
        'minis_25': total_minis,
        'minis_100': total_minis,
        'minis_500': total_minis,
        'points_1000': max_points,
        'points_2000': max_points,
        # Social
        'first_post': public_count,
        'posts_10': public_count,
        'posts_50': public_count,
        'first_like': total_likes_received,
        'likes_50': total_likes_received,
        'likes_500': total_likes_received,
        'first_comment': comments_made,
        'comments_50': comments_made,
        'followers_5': follower_count,
        'followers_25': follower_count,
        'followers_100': follower_count,
        'following_10': following_count,
        # Explorer
        'multi_faction': len(faction_ids),
        'multi_game': len(game_system_ids),
        'full_paint_collection': 1 if has_fully_painted else 0,
    }

    achievements = Achievement.objects.filter(is_active=True)
    for ach in achievements:
        if ach.key in already:
            continue
        current_value = checks.get(ach.key, 0)
        if current_value >= ach.threshold:
            UserAchievement.objects.create(user=user, achievement=ach)
            create_notification(
                recipient=user,
                notification_type='achievement',
                achievement=ach,
                message=f'🏆 Achievement unlocked: {ach.name}!',
            )
            newly_unlocked.append(ach)

    return newly_unlocked

