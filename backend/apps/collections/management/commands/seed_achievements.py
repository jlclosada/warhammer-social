from django.core.management.base import BaseCommand
from apps.collections.services import seed_achievements


class Command(BaseCommand):
    help = 'Seed achievement definitions into the database.'

    def handle(self, *args, **options):
        created = seed_achievements()
        self.stdout.write(self.style.SUCCESS(f'Done. {created} new achievements created.'))

