import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('collections', '0004_tags_catalog_enhancements'),
    ]

    operations = [
        # Collection.faction was added as nullable in 0003, model now requires it
        migrations.AlterField(
            model_name='collection',
            name='faction',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='collections',
                to='collections.faction',
            ),
        ),
    ]

