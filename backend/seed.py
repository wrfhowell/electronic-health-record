"""Idempotent seed script: drops and recreates ehr.db, then populates it with the
demo data captured in practice_fusion_scrape/ (12 Demo patients, Steve DemoCardio's
full chart, this week's appointments, tasks, and messages)."""

from datetime import date, datetime, timedelta

import models
from database import Base, SessionLocal, engine
from routers.encounters import compute_bmi

TODAY = date(2026, 7, 12)
PHONE = "(555) 555-5555"


def week_day(weekday: int) -> date:
    """Date of the given weekday (0=Mon) in the current week."""
    monday = TODAY - timedelta(days=TODAY.weekday())
    return monday + timedelta(days=weekday)


def seed() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    will = models.Provider(
        first_name="Will", last_name="Demo", title="MD", practice_name="Will Demo Practice"
    )
    db.add(will)
    db.flush()

    # --- Patients (the 12 "Demo" patients from step_040) ---
    accessed = datetime(2026, 7, 12, 21, 53)

    def patient(first, last, prn, dob, sex, street, city, state, zip_, **extra):
        return models.Patient(
            first_name=first,
            last_name=last,
            prn=prn,
            dob=dob,
            sex=sex,
            phone_mobile=PHONE,
            phone_home=PHONE,
            email=f"{first.split()[0]}.{last}@demotest.com",
            address_street=street,
            address_city=city,
            address_state=state,
            address_zip=zip_,
            status="Active",
            last_accessed_at=accessed,
            **extra,
        )

    patients = [
        patient("Jennifer", "DemoRheum", "JR572205", date(1962, 2, 9), "Female",
                "18 Run Road", "Livingston", "NJ", "07039"),
        patient("Eric", "DemoGastro", "EG629610", date(1968, 6, 22), "Male",
                "901 Maple St.", "San Antonio", "TX", "78023"),
        patient("Eric R", "DemoPsych", "EP108956", date(1965, 3, 1), "Male",
                "783 Washington Ave", "Hollytown", "NH", "33220"),
        patient("Michael T", "DemoPrimaryCare", "MO686770", date(1958, 7, 5), "Male",
                "5432 Rebrow St", "Lakeside", "NY", "27511"),
        patient("Steve", "DemoCardio", "SS892268", date(1943, 3, 15), "Male",
                "47 Peach Lane", "Atlanta", "GA", "30032",
                insurance_payer="Medicare", insurance_plan="Medicare Part B",
                insurance_member_id="1EG4-TE5-MK72", insurance_group_id="—",
                guarantor_name="Steve DemoCardio"),
        patient("Cindy", "DemoObstetrics", "CO711603", date(1982, 1, 14), "Female",
                "312 S 67th St.", "Schenectady", "NY", "12345"),
        patient("Brenda", "DemoOncology", "BO958186", date(1951, 7, 15), "Female",
                "4700 Milword Drive", "Stony Brook", "NY", "11790"),
        patient("Michelle", "DemoGyn", "MG875244", date(1955, 5, 16), "Female",
                "123 S. 45th St.", "Anytown", "NY", "12345"),
        patient("Nancy", "DemoObstetrics", "NO731672", date(1982, 4, 8), "Female",
                "321 S. 54th St", "Anytown", "NY", "12345"),
        patient("Shana", "DemoPeds", "SP708107", date(2005, 11, 8), "Female",
                "488 Taylor St", "San Francisco", "CA", "94110"),
        patient("Jaclyn M", "DemoENT", "JE742116", date(1985, 10, 21), "Female",
                "323 Elast Drive", "Brownsville", "PA", "49300"),
        patient("John", "DemoPrimaryCare", "JD664208", date(1977, 3, 30), "Male",
                "4994 Shady Range", "Ossawinamakee Beach", "MN", "56468"),
    ]
    db.add_all(patients)
    db.flush()
    by_prn = {p.prn: p for p in patients}
    steve = by_prn["SS892268"]

    # --- Steve DemoCardio's chart (from steps 016, 023-029) ---
    db.add_all([
        models.Diagnosis(patient_id=steve.id, icd10="I11.0",
                         description="Congestive heart failure", is_chronic=True),
        models.Diagnosis(patient_id=steve.id, icd10="I10",
                         description="Hypertension", is_chronic=True),
        models.Diagnosis(patient_id=steve.id, icd10="E11.9",
                         description="Diabetes mellitus", is_chronic=True),
    ])

    db.add_all([
        models.Medication(
            patient_id=steve.id, name="Furosemide (Lasix) 80 MG Oral Tablet",
            sig="Take half of a tablet (40 mg) by mouth 2 times per day",
            start_date=date(2026, 4, 20), status="active", prescriber="Will Demo"),
        models.Medication(
            patient_id=steve.id, name="Lisinopril 20 MG Oral Tablet",
            sig="Take 1 tablet (20 mg) by mouth daily",
            start_date=date(2026, 4, 20), status="active", prescriber="Will Demo"),
        models.Medication(
            patient_id=steve.id, name="Furosemide (Lasix) 40 MG Oral Tablet",
            sig="Take half of a tablet (20 mg) by mouth 2 times per day",
            start_date=date(2026, 4, 6), stop_date=date(2026, 4, 20),
            status="historical", prescriber="Will Demo"),
        models.Medication(
            patient_id=steve.id, name="Metformin 500 MG Oral Tablet",
            sig="Take 1 tablet by mouth 2 times per day",
            start_date=date(2025, 1, 10), stop_date=date(2026, 3, 1),
            status="historical", prescriber="Will Demo"),
    ])

    subjective = (
        'Patient is a 71 year old male with a history of new-onset CHF (NYHA Class II), '
        'HTN, and non-insulin dependent DM who presents with 3 days of dyspnea. He was '
        'initially diagnosed two months ago by his PCP after an echocardiogram revealed '
        'an EF of 45%. He notes that the shortness of breath is worse at night and on '
        'exertion and improves when he uses an extra pillow. He denies PND. He also '
        'endorses mild mid-chest tightness that does not radiate, and he denies arm '
        'pain, back pain, or jaw pain. The patient reports that he "ran out of his '
        'water pill" 1 week ago and has gained 3-4 lbs since then.\n\n'
        "REVIEW OF SYSTEMS\n"
        "General: Denies fevers, chills, malaise\n"
        "HEENT: Denies headaches, change in vision, diplopia, eye pain, ear pain, "
        "hearing loss, coryza, nasal discharge, sore throat.\n"
        "Chest: as per HPI. Denies wheezing, cough, hemoptysis.\n"
        "Heart: as per HPI. Denies palpitations.\n"
        "Abdomen: Denies change in appetite, dysphagia, abdominal pain, change in "
        "bowel habit, emesis, or melena.\n"
        "Neurologic: Denies weakness, tremor, changes in mentation, ataxia.\n"
        "Skin: Denies rashes"
    )
    objective = (
        "Vitals: Hypertensive, other vitals WNL\n"
        "General: The patient is an elderly-appearing gentleman in no acute distress "
        "sitting comfortably on an exam table.\n"
        "HEENT: NCAT, sclera anicteric, EOMI, TMs normal, non-erythematous pharynx.\n"
        "Neck: Supple without lymphadenopathy. JVP 10cm.\n"
        "Cardiovascular: normal S1,S2. +S3 heart sound, no S4. 2/6 holosystolic murmur "
        "heard best at RUSB that radiates to the carotids. No other murmurs, rubs, or "
        "gallops. Radial and posterior tibialis pulses 2+.\n"
        "Pulmonary: Mild inspiratory crackles bilaterally without wheezes or rhonchi. "
        "Good inspiratory effort, no use of accessory respiratory muscles.\n"
        "Abdomen: Soft, non-tender, non-distended. NABS. No masses.\n"
        "Extremities/Skin: 2+ pitting edema bilateral lower extremities, warm skin, "
        "venous stasis changes bilateral lower extremities. No other rashes, no "
        "clubbing or cyanosis."
    )
    assessment = (
        "Patient is a 73-yo male with h/o CHF, NYHA Class II, and DM who presents with "
        "1 week of progressive dyspnea, orthopnea, and 3-4 lb weight gain in the "
        "setting of self-discontinuation of diuretic, c/w CHF exacerbation. DDx "
        "includes new-onset COPD."
    )
    plan_note = (
        "Restart Lasix 40mg qd, counsel on medication compliance and dietary "
        "discretion. Daily weights and return to clinic if symptoms don't improve. ED "
        "if dyspnea or chest tightness worsen."
    )

    def encounter(dt, note_type, cc, status="Unsigned", **notes):
        return models.Encounter(
            patient_id=steve.id, provider_id=will.id, date=dt, type="Office Visit",
            note_type=note_type, status=status, chief_complaint=cc,
            facility="Will Demo Practice",
            signed_at=datetime.combine(dt, datetime.min.time()) if status == "Signed" else None,
            **notes,
        )

    enc_0420 = encounter(
        date(2026, 4, 20), "SOAP Note", "Shortness of breath", status="Signed",
        subjective="Patient presents with progressive shortness of breath over the "
                   "past two weeks, worse with exertion.",
        objective="BP elevated at 156/92. Bibasilar crackles. 1+ pitting edema.",
        assessment="New-onset congestive heart failure (NYHA Class II). Hypertension, "
                   "poorly controlled. Diabetes mellitus, stable.",
        plan_note="Start Furosemide 40 mg BID and Lisinopril 20 mg daily. "
                  "Echocardiogram ordered. Follow up in 2-3 weeks.",
    )
    enc_0509 = encounter(date(2026, 5, 9), "Patient Phone Message", "refill")
    enc_0609 = encounter(date(2026, 6, 9), "Patient Phone Message", "test results")
    enc_0629 = encounter(
        date(2026, 6, 29), "SOAP Note", "Test results",
        subjective="Patient returns to review echocardiogram results. Reports "
                   "improved breathing on current regimen.",
        objective="Echocardiogram: EF 45%, mild LVH. Lungs clear. Trace edema.",
        assessment="CHF (NYHA Class II), improved on diuretic therapy. HTN, improved.",
        plan_note="Continue current medications. Recheck BMP in 4 weeks.",
    )
    enc_0707 = encounter(
        date(2026, 7, 7), "SOAP Note", "Hard to breathe",
        subjective=subjective, objective=objective,
        assessment=assessment, plan_note=plan_note,
    )
    db.add_all([enc_0420, enc_0509, enc_0609, enc_0629, enc_0707])
    db.flush()

    # Vitals flowsheet columns from step_024/025: 04/20/26, 05/09/26, 06/29/26
    for enc, weight, bp, temp, pulse in [
        (enc_0420, 201, (156, 92), 98.9, 86),
        (enc_0509, 212, (162, 90), 98.7, 88),
        (enc_0629, 212, (140, 86), 98.8, 82),
    ]:
        db.add(models.Vitals(
            encounter_id=enc.id, height_in=67, weight_lb=weight,
            bmi=compute_bmi(67, weight), bp_systolic=bp[0], bp_diastolic=bp[1],
            temp_f=temp, pulse=pulse, resp_rate=16,
        ))

    db.add_all([
        models.Document(
            patient_id=steve.id, title="Echocardiogram Report", type="Imaging result",
            provider="Will Demo", date=date(2026, 6, 25), size="1.2 MB", status="Signed"),
        models.Document(
            patient_id=steve.id, title="BMP Lab Results", type="Lab result",
            provider="Will Demo", date=date(2026, 6, 20), size="184 KB", status="Signed"),
        models.Document(
            patient_id=steve.id, title="Cardiology Referral Letter", type="Referral",
            provider="Will Demo", date=date(2026, 7, 7), size="96 KB", status="Pending"),
    ])

    # A little chart color for two more patients so their summaries aren't bare.
    jennifer = by_prn["JR572205"]
    db.add_all([
        models.Diagnosis(patient_id=jennifer.id, icd10="M06.9",
                         description="Rheumatoid arthritis", is_chronic=True),
        models.Medication(
            patient_id=jennifer.id, name="Methotrexate 2.5 MG Oral Tablet",
            sig="Take 6 tablets (15 mg) by mouth once weekly",
            start_date=date(2025, 11, 3), status="active", prescriber="Will Demo"),
        models.Allergy(patient_id=jennifer.id, category="drug",
                       substance="Penicillin", reaction="Hives"),
    ])
    eric = by_prn["EG629610"]
    db.add_all([
        models.Diagnosis(patient_id=eric.id, icd10="K21.9",
                         description="Gastro-esophageal reflux disease", is_chronic=True),
        models.Medication(
            patient_id=eric.id, name="Omeprazole 20 MG Delayed Release Capsule",
            sig="Take 1 capsule by mouth daily before breakfast",
            start_date=date(2026, 2, 14), status="active", prescriber="Will Demo"),
    ])

    # --- Appointments this week ---
    db.add_all([
        models.Appointment(
            patient_id=steve.id, provider_id=will.id, date=week_day(0),
            start_time="09:00", end_time="09:30", type="Follow-Up Visit",
            status="Seen", chief_complaint="CHF follow-up"),
        models.Appointment(
            patient_id=jennifer.id, provider_id=will.id, date=week_day(1),
            start_time="10:00", end_time="10:30", type="Office Visit",
            status="Confirmed", chief_complaint="Joint pain"),
        models.Appointment(
            patient_id=eric.id, provider_id=will.id, date=week_day(2),
            start_time="14:00", end_time="14:30", type="Office Visit",
            status="Pending", chief_complaint="Heartburn"),
        models.Appointment(
            patient_id=by_prn["SP708107"].id, provider_id=will.id, date=week_day(3),
            start_time="11:00", end_time="11:30", type="Wellness Exam",
            status="Pending", chief_complaint="Annual physical"),
        models.Appointment(
            patient_id=by_prn["MO686770"].id, provider_id=will.id, date=week_day(4),
            start_time="15:30", end_time="16:00", type="New Patient Visit",
            status="Confirmed", chief_complaint="Establish care"),
        models.Appointment(
            provider_id=will.id, date=week_day(4), start_time="12:00",
            end_time="13:00", type="Block", status="Blocked",
            is_block=True, block_reason="Lunch"),
    ])

    # --- Tasks ---
    db.add_all([
        models.Task(
            details="Review echocardiogram results and call patient",
            assignee="Will Demo", patient_id=steve.id, reminder_date=TODAY,
            task_type="Lab results", status="incomplete", author="Will Demo"),
        models.Task(
            details="Refill request: Omeprazole 20 MG",
            assignee="Will Demo", patient_id=eric.id,
            reminder_date=TODAY + timedelta(days=1),
            task_type="Refill requests", status="incomplete", author="Will Demo"),
        models.Task(
            details="Schedule follow-up rheumatology labs (CBC, CMP)",
            assignee=None, patient_id=jennifer.id,
            reminder_date=TODAY + timedelta(days=7),
            task_type="Lab results", status="incomplete", author="Will Demo"),
        models.Task(
            details="Fax records to referring provider",
            assignee="Will Demo", patient_id=steve.id,
            reminder_date=TODAY - timedelta(days=3),
            task_type="Rx change/cancel", status="complete", author="Will Demo"),
    ])

    # --- Messages ---
    db.add_all([
        models.Message(
            from_user="Steve DemoCardio", to_user="Will Demo", patient_id=steve.id,
            subject="Question about water pill dosage",
            body="Dr. Demo, should I keep taking half a tablet twice a day now that "
                 "I'm feeling better? Thanks, Steve",
            urgent=False, folder="inbox", read=False,
            created_at=datetime(2026, 7, 11, 9, 14)),
        models.Message(
            from_user="Jennifer DemoRheum", to_user="Will Demo", patient_id=jennifer.id,
            subject="Methotrexate side effects",
            body="I've been feeling nauseous the day after my weekly dose. Is that "
                 "normal?",
            urgent=True, folder="inbox", read=False,
            created_at=datetime(2026, 7, 10, 16, 42)),
        models.Message(
            from_user="Will Demo", to_user="Front Desk", patient_id=None,
            subject="Schedule note for next week",
            body="Please keep Friday afternoon open for hospital rounds.",
            urgent=False, folder="sent", read=True,
            created_at=datetime(2026, 7, 9, 8, 5)),
        models.Message(
            from_user="Eric DemoGastro", to_user="Will Demo", patient_id=eric.id,
            subject="Appointment reschedule",
            body="Can I move Wednesday's visit to later in the day?",
            urgent=False, folder="archive", read=True,
            created_at=datetime(2026, 7, 6, 13, 20)),
    ])

    db.commit()
    db.close()
    print(f"Seeded {len(patients)} patients into {engine.url.database}")


if __name__ == "__main__":
    seed()
