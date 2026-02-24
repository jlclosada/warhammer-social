import uuid
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('collections', '0005_alter_collection_faction'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # ── Collection: add banner_image ──
        migrations.AddField(
            model_name='collection',
            name='banner_image',
            field=models.ImageField(blank=True, null=True, upload_to='collections/banners/', verbose_name='banner image'),
        ),

        # ── Miniature: add is_public ──
        migrations.AddField(
            model_name='miniature',
            name='is_public',
            field=models.BooleanField(default=False, help_text='Only fully painted miniatures can be made public.', verbose_name='public'),
        ),

        # ── Follow ──
        migrations.CreateModel(
            name='Follow',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('follower', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='following', to=settings.AUTH_USER_MODEL)),
                ('following', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='followers', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('follower', 'following')},
            },
        ),

        # ── Like ──
        migrations.CreateModel(
            name='Like',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='likes', to=settings.AUTH_USER_MODEL)),
                ('miniature', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='likes', to='collections.miniature')),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('user', 'miniature')},
            },
        ),

        # ── Save ──
        migrations.CreateModel(
            name='Save',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_miniatures', to=settings.AUTH_USER_MODEL)),
                ('miniature', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saves', to='collections.miniature')),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('user', 'miniature')},
            },
        ),

        # ── Comment ──
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('text', models.TextField(max_length=2000, verbose_name='text')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to=settings.AUTH_USER_MODEL)),
                ('miniature', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='collections.miniature')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]

