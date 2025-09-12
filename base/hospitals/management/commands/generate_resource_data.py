import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from hospitals.models import Hospital, ResourceSnapshot


class Command(BaseCommand):
    help = "Generate random fluctuating resource usage data for hospitals."

    def handle(self, *args, **kwargs):
        hospitals = Hospital.objects.all()

        if not hospitals.exists():
            self.stdout.write(self.style.WARNING("⚠️ No hospitals found in database."))
            return

        for hospital in hospitals:
            # Get last snapshot for smooth fluctuation
            last_snapshot = hospital.snapshots.order_by("-timestamp").first()

            def fluctuate(base, capacity):
                """Fluctuate around last value or generate new random if no snapshot exists"""
                if last_snapshot:
                    prev = getattr(last_snapshot, base)
                    # smooth variation within ±10% of previous, clipped to [0, capacity]
                    change = random.randint(-int(0.1 * capacity), int(0.1 * capacity))
                    new_val = max(0, min(capacity, prev + change))
                else:
                    # first snapshot: random between 40% and 80% of capacity
                    new_val = random.randint(int(0.4 * capacity), int(0.8 * capacity))
                return new_val

            occupied_beds = fluctuate("occupied_beds", hospital.total_beds)
            occupied_icu = fluctuate("occupied_icu", hospital.icu_beds)
            occupied_oxygen = fluctuate("occupied_oxygen", hospital.oxygen_cylinders)
            occupied_ventilators = fluctuate("occupied_ventilators", hospital.ventilators)
            occupied_doctors = fluctuate("occupied_doctors", hospital.doctors)
            occupied_nurses = fluctuate("occupied_nurses", hospital.nurses)

            # Save snapshot
            ResourceSnapshot.objects.create(
                hospital=hospital,
                timestamp=timezone.now(),
                occupied_beds=occupied_beds,
                occupied_icu=occupied_icu,
                occupied_oxygen=occupied_oxygen,
                occupied_ventilators=occupied_ventilators,
                occupied_doctors=occupied_doctors,
                occupied_nurses=occupied_nurses,
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ Snapshot created for {hospital.name}: Beds={occupied_beds}/{hospital.total_beds}, "
                    f"ICU={occupied_icu}/{hospital.icu_beds}, O2={occupied_oxygen}/{hospital.oxygen_cylinders}, "
                    f"Vents={occupied_ventilators}/{hospital.ventilators}, "
                    f"Doctors={occupied_doctors}/{hospital.doctors}, Nurses={occupied_nurses}/{hospital.nurses}"
                )
            )
