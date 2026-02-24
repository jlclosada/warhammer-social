import uuid
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('collections', '0006_social_features'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # ── Achievement ──
        migrations.CreateModel(
            name='Achievement',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('key', models.CharField(max_length=100, unique=True, verbose_name='key')),
                ('name', models.CharField(max_length=200, verbose_name='name')),
                ('description', models.TextField(verbose_name='description')),
                ('icon', models.CharField(default='trophy', max_length=50, verbose_name='icon')),
                ('category', models.CharField(choices=[('painting', 'Painting'), ('collecting', 'Collecting'), ('social', 'Social'), ('explorer', 'Explorer')], max_length=20, verbose_name='category')),
                ('rarity', models.CharField(choices=[('common', 'Common'), ('uncommon', 'Uncommon'), ('rare', 'Rare'), ('epic', 'Epic'), ('legendary', 'Legendary')], default='common', max_length=20, verbose_name='rarity')),
                ('threshold', models.PositiveIntegerField(default=1, help_text='Number required to unlock this achievement.', verbose_name='threshold')),
                ('points', models.PositiveIntegerField(default=10, verbose_name='points')),
                ('is_active', models.BooleanField(default=True, verbose_name='active')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'achievement',
                'verbose_name_plural': 'achievements',
                'ordering': ['category', 'threshold'],
            },
        ),

        # ── Notification ──
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('notification_type', models.CharField(choices=[('like', 'Like'), ('comment', 'Comment'), ('follow', 'Follow'), ('achievement', 'Achievement'), ('milestone', 'Milestone')], max_length=20, verbose_name='type')),
                ('message', models.CharField(blank=True, max_length=500, verbose_name='message')),
                ('is_read', models.BooleanField(default=False, verbose_name='read')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('recipient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
                ('actor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='actions', to=settings.AUTH_USER_MODEL)),
                ('miniature', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='collections.miniature')),
                ('achievement', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='collections.achievement')),
            ],
            options={
                'verbose_name': 'notification',
                'verbose_name_plural': 'notifications',
                'ordering': ['-created_at'],
            },
        ),

        # ── UserAchievement ──
        migrations.CreateModel(
            name='UserAchievement',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('unlocked_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='achievements', to=settings.AUTH_USER_MODEL)),
                ('achievement', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='unlocked_by', to='collections.achievement')),
            ],
            options={
                'verbose_name': 'user achievement',
                'verbose_name_plural': 'user achievements',
                'ordering': ['-unlocked_at'],
                'unique_together': {('user', 'achievement')},
            },
        ),
    ]

