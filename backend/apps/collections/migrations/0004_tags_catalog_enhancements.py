import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('collections', '0003_factions_catalog_images'),
    ]

    operations = [
        # ── Tag model ──
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True, verbose_name='name')),
                ('slug', models.SlugField(max_length=100, unique=True, verbose_name='slug')),
            ],
            options={
                'verbose_name': 'tag',
                'verbose_name_plural': 'tags',
                'ordering': ['name'],
            },
        ),

        # ── CatalogMiniature: add tags M2M ──
        migrations.AddField(
            model_name='catalogminiature',
            name='tags',
            field=models.ManyToManyField(blank=True, related_name='miniatures', to='collections.tag'),
        ),

        # ── CatalogMiniature: add name_es ──
        migrations.AddField(
            model_name='catalogminiature',
            name='name_es',
            field=models.CharField(blank=True, max_length=300, verbose_name='name (Spanish)'),
        ),

        # ── CatalogMiniature: add image ──
        migrations.AddField(
            model_name='catalogminiature',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='catalog/', verbose_name='image'),
        ),

        # ── CatalogMiniature: add updated_at ──
        migrations.AddField(
            model_name='catalogminiature',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]

