import datetime as dt

from pydantic import BaseModel, ConfigDict, computed_field


class OrmModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- Providers ----------


class ProviderOut(OrmModel):
    id: int
    first_name: str
    last_name: str
    title: str | None = None
    practice_name: str


# ---------- Patients ----------


class PatientBase(BaseModel):
    first_name: str
    last_name: str
    dob: dt.date
    sex: str
    phone_mobile: str | None = None
    phone_home: str | None = None
    phone_work: str | None = None
    email: str | None = None
    address_street: str | None = None
    address_city: str | None = None
    address_state: str | None = None
    address_zip: str | None = None
    status: str = "Active"
    insurance_payer: str | None = None
    insurance_plan: str | None = None
    insurance_member_id: str | None = None
    insurance_group_id: str | None = None
    guarantor_name: str | None = None


class PatientCreate(PatientBase):
    prn: str | None = None  # generated if omitted


class PatientUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    dob: dt.date | None = None
    sex: str | None = None
    phone_mobile: str | None = None
    phone_home: str | None = None
    phone_work: str | None = None
    email: str | None = None
    address_street: str | None = None
    address_city: str | None = None
    address_state: str | None = None
    address_zip: str | None = None
    status: str | None = None
    insurance_payer: str | None = None
    insurance_plan: str | None = None
    insurance_member_id: str | None = None
    insurance_group_id: str | None = None
    guarantor_name: str | None = None


class PatientOut(PatientBase, OrmModel):
    id: int
    prn: str
    last_accessed_at: dt.datetime | None = None


# ---------- Clinical ----------


class DiagnosisOut(OrmModel):
    id: int
    patient_id: int
    icd10: str
    description: str
    is_chronic: bool


class MedicationOut(OrmModel):
    id: int
    patient_id: int
    name: str
    sig: str | None = None
    start_date: dt.date | None = None
    stop_date: dt.date | None = None
    status: str
    prescriber: str | None = None


class AllergyOut(OrmModel):
    id: int
    patient_id: int
    category: str
    substance: str
    reaction: str | None = None


class VitalsIn(BaseModel):
    height_in: float | None = None
    weight_lb: float | None = None
    bp_systolic: int | None = None
    bp_diastolic: int | None = None
    temp_f: float | None = None
    pulse: int | None = None
    resp_rate: int | None = None
    o2_sat: int | None = None
    pain: int | None = None


class VitalsOut(VitalsIn, OrmModel):
    id: int
    encounter_id: int
    bmi: float | None = None


class EncounterCreate(BaseModel):
    patient_id: int
    date: dt.date
    type: str = "Office Visit"
    note_type: str = "SOAP Note"
    chief_complaint: str | None = None
    subjective: str | None = None
    objective: str | None = None
    assessment: str | None = None
    plan_note: str | None = None


class EncounterUpdate(BaseModel):
    date: dt.date | None = None
    type: str | None = None
    note_type: str | None = None
    chief_complaint: str | None = None
    subjective: str | None = None
    objective: str | None = None
    assessment: str | None = None
    plan_note: str | None = None


class EncounterOut(OrmModel):
    id: int
    patient_id: int
    provider_id: int | None = None
    date: dt.date
    type: str
    note_type: str
    status: str
    facility: str | None = None
    chief_complaint: str | None = None
    subjective: str | None = None
    objective: str | None = None
    assessment: str | None = None
    plan_note: str | None = None
    signed_at: dt.datetime | None = None
    vitals: VitalsOut | None = None


# ---------- Appointments ----------


class AppointmentCreate(BaseModel):
    patient_id: int | None = None
    provider_id: int | None = None
    date: dt.date
    start_time: str
    end_time: str
    type: str = "Office Visit"
    status: str = "Pending"
    chief_complaint: str | None = None
    facility: str | None = "Will Demo Practice"
    note: str | None = None
    is_block: bool = False
    block_reason: str | None = None


class AppointmentUpdate(BaseModel):
    patient_id: int | None = None
    date: dt.date | None = None
    start_time: str | None = None
    end_time: str | None = None
    type: str | None = None
    status: str | None = None
    chief_complaint: str | None = None
    facility: str | None = None
    note: str | None = None
    block_reason: str | None = None


class AppointmentOut(OrmModel):
    id: int
    patient_id: int | None = None
    provider_id: int | None = None
    date: dt.date
    start_time: str
    end_time: str
    type: str
    status: str
    chief_complaint: str | None = None
    facility: str | None = None
    note: str | None = None
    is_block: bool
    block_reason: str | None = None
    patient: PatientOut | None = None


# ---------- Tasks ----------


class TaskCreate(BaseModel):
    details: str
    assignee: str | None = None
    patient_id: int | None = None
    reminder_date: dt.date | None = None
    task_type: str | None = None
    author: str | None = "Will Demo"


class TaskUpdate(BaseModel):
    details: str | None = None
    assignee: str | None = None
    patient_id: int | None = None
    reminder_date: dt.date | None = None
    task_type: str | None = None
    status: str | None = None


class TaskOut(OrmModel):
    id: int
    details: str
    assignee: str | None = None
    patient_id: int | None = None
    reminder_date: dt.date | None = None
    task_type: str | None = None
    status: str
    author: str | None = None
    created_at: dt.datetime
    patient: PatientOut | None = None


# ---------- Messages ----------


class MessageCreate(BaseModel):
    from_user: str = "Will Demo"
    to_user: str
    patient_id: int | None = None
    subject: str
    body: str | None = None
    urgent: bool = False


class MessageUpdate(BaseModel):
    folder: str | None = None
    read: bool | None = None


class MessageOut(OrmModel):
    id: int
    from_user: str
    to_user: str
    patient_id: int | None = None
    subject: str
    body: str | None = None
    urgent: bool
    folder: str
    read: bool
    created_at: dt.datetime
    patient: PatientOut | None = None


# ---------- Documents ----------


class DocumentOut(OrmModel):
    id: int
    patient_id: int
    title: str
    type: str | None = None
    provider: str | None = None
    date: dt.date | None = None
    size: str | None = None
    status: str
    comments: str | None = None


# ---------- Chart summary ----------


class PatientSummary(BaseModel):
    patient: PatientOut
    diagnoses: list[DiagnosisOut]
    medications: list[MedicationOut]
    allergies: list[AllergyOut]
    encounters: list[EncounterOut]
    documents: list[DocumentOut]

    @computed_field
    @property
    def vitals_history(self) -> list[VitalsOut]:
        """Vitals columns for the flowsheet, oldest first."""
        rows = [e.vitals for e in self.encounters if e.vitals is not None]
        order = {e.vitals.encounter_id: e.date for e in self.encounters if e.vitals}
        return sorted(rows, key=lambda v: order[v.encounter_id])
