import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class GameSystem(models.Model):
    """Supported game systems."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_('name'), max_length=200, unique=True)
    slug = models.SlugField(_('slug'), max_length=200, unique=True)
    description = models.TextField(_('description'), blank=True)
    logo = models.ImageField(_('logo'), upload_to='game_systems/', blank=True, null=True)
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('game system')
        verbose_name_plural = _('game systems')
        ordering = ['name']

    def __str__(self):
        return self.name


class FactionCategory(models.TextChoices):
    """Top-level faction allegiances."""
    CHAOS = 'chaos', _('Chaos')
    IMPERIUM = 'imperium', _('Imperium')
    XENOS = 'xenos', _('Xenos')
    ORDER = 'order', _('Order')
    DESTRUCTION = 'destruction', _('Destruction')
    DEATH = 'death', _('Death')
    GOOD = 'good', _('Good')
    EVIL = 'evil', _('Evil')
    NEUTRAL = 'neutral', _('Neutral')


class Faction(models.Model):
    """A faction belonging to a game system."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game_system = models.ForeignKey(
        GameSystem,
        on_delete=models.CASCADE,
        related_name='factions',
    )
    name = models.CharField(_('name'), max_length=200)
    slug = models.SlugField(_('slug'), max_length=200)
    category = models.CharField(
        _('category'),
        max_length=30,
        choices=FactionCategory.choices,
    )
    description = models.TextField(_('description'), blank=True)
    icon = models.ImageField(_('icon'), upload_to='factions/', blank=True, null=True)
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('faction')
        verbose_name_plural = _('factions')
        ordering = ['name']
        unique_together = ['game_system', 'slug']

    def __str__(self):
        return f'{self.name} ({self.game_system.name})'


class Tag(models.Model):
    """Reusable tags for catalog miniatures (e.g., Character, Psyker, Vehicle)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_('name'), max_length=100, unique=True)
    slug = models.SlugField(_('slug'), max_length=100, unique=True)

    class Meta:
        verbose_name = _('tag')
        verbose_name_plural = _('tags')
        ordering = ['name']

    def __str__(self):
        return self.name


class CatalogMiniature(models.Model):
    """Master catalog of all miniatures available per faction."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    faction = models.ForeignKey(
        Faction,
        on_delete=models.CASCADE,
        related_name='catalog_miniatures',
    )
    name = models.CharField(_('name'), max_length=300)
    name_es = models.CharField(_('name (Spanish)'), max_length=300, blank=True)
    slug = models.SlugField(_('slug'), max_length=300)
    unit_type = models.CharField(
        _('unit type'),
        max_length=50,
        blank=True,
        help_text=_('e.g., HQ, Troops, Elites, Heavy Support, Fast Attack'),
    )
    default_points = models.PositiveIntegerField(_('default points'), default=0)
    description = models.TextField(_('description'), blank=True)
    image = models.ImageField(_('image'), upload_to='catalog/', blank=True, null=True)
    tags = models.ManyToManyField(Tag, related_name='miniatures', blank=True)
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('catalog miniature')
        verbose_name_plural = _('catalog miniatures')
        ordering = ['unit_type', 'name']
        unique_together = ['faction', 'slug']

    def __str__(self):
        return f'{self.name} - {self.faction.name}'


class Collection(models.Model):
    """A user's collection for a specific game system and faction."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='collections',
    )
    game_system = models.ForeignKey(
        GameSystem,
        on_delete=models.PROTECT,
        related_name='collections',
    )
    faction = models.ForeignKey(
        Faction,
        on_delete=models.PROTECT,
        related_name='collections',
    )
    name = models.CharField(_('name'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    is_public = models.BooleanField(_('public'), default=True)
    cover_image = models.ImageField(_('cover image'), upload_to='collections/', blank=True, null=True)
    banner_image = models.ImageField(_('banner image'), upload_to='collections/banners/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('collection')
        verbose_name_plural = _('collections')
        ordering = ['-updated_at']
        unique_together = ['user', 'name']

    def __str__(self):
        return f'{self.name} ({self.user.username})'

    @property
    def miniature_count(self):
        return sum(m.quantity for m in self.miniatures.all())

    @property
    def total_points(self):
        return sum(m.points_cost * m.quantity for m in self.miniatures.all())

    @property
    def paint_progress(self):
        total = sum(m.quantity for m in self.miniatures.all())
        if total == 0:
            return 0
        painted = sum(
            m.quantity for m in self.miniatures.exclude(
                paint_status=Miniature.PaintStatus.UNPAINTED
            )
        )
        return round((painted / total) * 100)


class Miniature(models.Model):
    """A miniature within a user's collection."""

    class PaintStatus(models.TextChoices):
        UNPAINTED = 'unpainted', _('Unpainted')
        ASSEMBLED = 'assembled', _('Assembled')
        PRIMED = 'primed', _('Primed')
        WIP = 'wip', _('Work in Progress')
        PAINTED = 'painted', _('Painted')
        BASED = 'based', _('Based')
        DISPLAY_READY = 'display_ready', _('Display Ready')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    collection = models.ForeignKey(
        Collection,
        on_delete=models.CASCADE,
        related_name='miniatures',
    )
    catalog_miniature = models.ForeignKey(
        CatalogMiniature,
        on_delete=models.SET_NULL,
        related_name='user_miniatures',
        null=True,
        blank=True,
    )
    name = models.CharField(_('name'), max_length=300)
    description = models.TextField(_('description'), blank=True)
    quantity = models.PositiveIntegerField(_('quantity'), default=1)
    paint_status = models.CharField(
        _('paint status'),
        max_length=20,
        choices=PaintStatus.choices,
        default=PaintStatus.UNPAINTED,
    )
    points_cost = models.PositiveIntegerField(_('points cost'), default=0, blank=True)
    painting_hours = models.DecimalField(
        _('painting hours'),
        max_digits=6,
        decimal_places=1,
        default=0,
    )
    notes = models.TextField(_('notes'), blank=True)
    is_public = models.BooleanField(
        _('public'),
        default=False,
        help_text=_('Only fully painted miniatures can be made public.'),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('miniature')
        verbose_name_plural = _('miniatures')
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Only allow public if painted, based, or display_ready
        if self.is_public and self.paint_status not in (
            self.PaintStatus.PAINTED,
            self.PaintStatus.BASED,
            self.PaintStatus.DISPLAY_READY,
        ):
            self.is_public = False
        super().save(*args, **kwargs)


class MiniatureImage(models.Model):
    """Images for a miniature."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    miniature = models.ForeignKey(
        Miniature,
        on_delete=models.CASCADE,
        related_name='images',
    )
    image = models.ImageField(_('image'), upload_to='miniatures/')
    caption = models.CharField(_('caption'), max_length=300, blank=True)
    is_primary = models.BooleanField(_('primary'), default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('miniature image')
        verbose_name_plural = _('miniature images')
        ordering = ['-is_primary', '-uploaded_at']

    def __str__(self):
        return f'Image for {self.miniature.name}'


# ═══════════════════════════════════════════
# SOCIAL MODELS
# ═══════════════════════════════════════════

class Follow(models.Model):
    """User follows another user."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='following',
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='followers',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['follower', 'following']
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.follower} → {self.following}'


class Like(models.Model):
    """User likes a miniature."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='likes',
    )
    miniature = models.ForeignKey(
        Miniature,
        on_delete=models.CASCADE,
        related_name='likes',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'miniature']
        ordering = ['-created_at']


class Save(models.Model):
    """User saves/bookmarks a miniature."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_miniatures',
    )
    miniature = models.ForeignKey(
        Miniature,
        on_delete=models.CASCADE,
        related_name='saves',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'miniature']
        ordering = ['-created_at']


class Comment(models.Model):
    """User comments on a miniature."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments',
    )
    miniature = models.ForeignKey(
        Miniature,
        on_delete=models.CASCADE,
        related_name='comments',
    )
    text = models.TextField(_('text'), max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} on {self.miniature}: {self.text[:50]}'


class CommentLike(models.Model):
    """User likes a comment."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comment_likes',
    )
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name='likes',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'comment']
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} liked comment {self.comment_id}'


# ═══════════════════════════════════════════
# NOTIFICATIONS
# ═══════════════════════════════════════════

class Notification(models.Model):
    """User notifications for social events."""

    class Type(models.TextChoices):
        LIKE = 'like', _('Like')
        COMMENT = 'comment', _('Comment')
        FOLLOW = 'follow', _('Follow')
        ACHIEVEMENT = 'achievement', _('Achievement')
        MILESTONE = 'milestone', _('Milestone')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='actions',
        null=True,
        blank=True,
    )
    notification_type = models.CharField(
        _('type'),
        max_length=20,
        choices=Type.choices,
    )
    miniature = models.ForeignKey(
        Miniature,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    achievement = models.ForeignKey(
        'Achievement',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    message = models.CharField(_('message'), max_length=500, blank=True)
    is_read = models.BooleanField(_('read'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('notification')
        verbose_name_plural = _('notifications')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.notification_type} → {self.recipient}'


# ═══════════════════════════════════════════
# ACHIEVEMENTS
# ═══════════════════════════════════════════

class Achievement(models.Model):
    """Achievement definitions."""

    class Category(models.TextChoices):
        PAINTING = 'painting', _('Painting')
        COLLECTING = 'collecting', _('Collecting')
        SOCIAL = 'social', _('Social')
        EXPLORER = 'explorer', _('Explorer')

    class Rarity(models.TextChoices):
        COMMON = 'common', _('Common')
        UNCOMMON = 'uncommon', _('Uncommon')
        RARE = 'rare', _('Rare')
        EPIC = 'epic', _('Epic')
        LEGENDARY = 'legendary', _('Legendary')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(_('key'), max_length=100, unique=True)
    name = models.CharField(_('name'), max_length=200)
    description = models.TextField(_('description'))
    icon = models.CharField(_('icon'), max_length=50, default='trophy')
    category = models.CharField(
        _('category'),
        max_length=20,
        choices=Category.choices,
    )
    rarity = models.CharField(
        _('rarity'),
        max_length=20,
        choices=Rarity.choices,
        default=Rarity.COMMON,
    )
    threshold = models.PositiveIntegerField(
        _('threshold'),
        default=1,
        help_text=_('Number required to unlock this achievement.'),
    )
    points = models.PositiveIntegerField(_('points'), default=10)
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('achievement')
        verbose_name_plural = _('achievements')
        ordering = ['category', 'threshold']

    def __str__(self):
        return f'{self.name} ({self.rarity})'


class UserAchievement(models.Model):
    """Tracks which achievements a user has unlocked."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='achievements',
    )
    achievement = models.ForeignKey(
        Achievement,
        on_delete=models.CASCADE,
        related_name='unlocked_by',
    )
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('user achievement')
        verbose_name_plural = _('user achievements')
        unique_together = ['user', 'achievement']
        ordering = ['-unlocked_at']

    def __str__(self):
        return f'{self.user} — {self.achievement.name}'

