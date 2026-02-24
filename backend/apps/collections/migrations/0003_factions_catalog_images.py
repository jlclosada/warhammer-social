import uuid
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('collections', '0002_initial'),
    ]

    operations = [
        # ── New models ──
        migrations.CreateModel(
            name='Faction',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200, verbose_name='name')),
                ('slug', models.SlugField(max_length=200, verbose_name='slug')),
                ('category', models.CharField(
                    choices=[
                        ('chaos', 'Chaos'), ('imperium', 'Imperium'), ('xenos', 'Xenos'),
                        ('order', 'Order'), ('destruction', 'Destruction'), ('death', 'Death'),
                        ('good', 'Good'), ('evil', 'Evil'), ('neutral', 'Neutral'),
                    ],
                    max_length=30, verbose_name='category',
                )),
                ('description', models.TextField(blank=True, verbose_name='description')),
                ('icon', models.ImageField(blank=True, null=True, upload_to='factions/', verbose_name='icon')),
                ('is_active', models.BooleanField(default=True, verbose_name='active')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('game_system', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='factions',
                    to='collections.gamesystem',
                )),
            ],
            options={
                'verbose_name': 'faction',
                'verbose_name_plural': 'factions',
                'ordering': ['name'],
                'unique_together': {('game_system', 'slug')},
            },
        ),
        migrations.CreateModel(
            name='CatalogMiniature',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=300, verbose_name='name')),
                ('slug', models.SlugField(max_length=300, verbose_name='slug')),
                ('unit_type', models.CharField(blank=True, help_text='e.g., HQ, Troops, Elites, Heavy Support, Fast Attack', max_length=50, verbose_name='unit type')),
                ('default_points', models.PositiveIntegerField(default=0, verbose_name='default points')),
                ('description', models.TextField(blank=True, verbose_name='description')),
                ('is_active', models.BooleanField(default=True, verbose_name='active')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('faction', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='catalog_miniatures',
                    to='collections.faction',
                )),
            ],
            options={
                'verbose_name': 'catalog miniature',
                'verbose_name_plural': 'catalog miniatures',
                'ordering': ['unit_type', 'name'],
                'unique_together': {('faction', 'slug')},
            },
        ),
        migrations.CreateModel(
            name='MiniatureImage',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('image', models.ImageField(upload_to='miniatures/', verbose_name='image')),
                ('caption', models.CharField(blank=True, max_length=300, verbose_name='caption')),
                ('is_primary', models.BooleanField(default=False, verbose_name='primary')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('miniature', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='images',
                    to='collections.miniature',
                )),
            ],
            options={
                'verbose_name': 'miniature image',
                'verbose_name_plural': 'miniature images',
                'ordering': ['-is_primary', '-uploaded_at'],
            },
        ),

        # ── Add faction FK to Collection ──
        migrations.AddField(
            model_name='collection',
            name='faction',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='collections',
                to='collections.faction',
            ),
        ),

        # ── Modify Miniature ──
        # Add catalog_miniature FK
        migrations.AddField(
            model_name='miniature',
            name='catalog_miniature',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='user_miniatures',
                to='collections.catalogminiature',
            ),
        ),
        # Add painting_hours
        migrations.AddField(
            model_name='miniature',
            name='painting_hours',
            field=models.DecimalField(decimal_places=1, default=0, max_digits=6, verbose_name='painting hours'),
        ),
        # Update name max_length
        migrations.AlterField(
            model_name='miniature',
            name='name',
            field=models.CharField(max_length=300, verbose_name='name'),
        ),
        # Update paint_status choices (add assembled, primed)
        migrations.AlterField(
            model_name='miniature',
            name='paint_status',
            field=models.CharField(
                choices=[
                    ('unpainted', 'Unpainted'), ('assembled', 'Assembled'),
                    ('primed', 'Primed'), ('wip', 'Work in Progress'),
                    ('painted', 'Painted'), ('based', 'Based'),
                    ('display_ready', 'Display Ready'),
                ],
                default='unpainted', max_length=20, verbose_name='paint status',
            ),
        ),
        # Remove old faction char field
        migrations.RemoveField(
            model_name='miniature',
            name='faction',
        ),
        # Remove old unit_type char field
        migrations.RemoveField(
            model_name='miniature',
            name='unit_type',
        ),
        # Remove old image field (replaced by MiniatureImage)
        migrations.RemoveField(
            model_name='miniature',
            name='image',
        ),
    ]

