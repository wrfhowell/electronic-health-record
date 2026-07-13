from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Provider(Base):
    __tablename__ = "providers"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(80))
    last_name: Mapped[str] = mapped_column(String(80))
    title: Mapped[str | None] = mapped_column(String(40))
    practice_name: Mapped[str] = mapped_column(String(120), default="Will Demo Practice")


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(80))
    last_name: Mapped[str] = mapped_column(String(80))
    prn: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    dob: Mapped[date] = mapped_column(Date)
    sex: Mapped[str] = mapped_column(String(10))
    phone_mobile: Mapped[str | None] = mapped_column(String(20))
    phone_home: Mapped[str | None] = mapped_column(String(20))
    phone_work: Mapped[str | None] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(120))
    address_street: Mapped[str | None] = mapped_column(String(120))
    address_city: Mapped[str | None] = mapped_column(String(80))
    address_state: Mapped[str | None] = mapped_column(String(2))
    address_zip: Mapped[str | None] = mapped_column(String(10))
    status: Mapped[str] = mapped_column(String(20), default="Active")
    insurance_payer: Mapped[str | None] = mapped_column(String(120))
    insurance_plan: Mapped[str | None] = mapped_column(String(120))
    insurance_member_id: Mapped[str | None] = mapped_column(String(40))
    insurance_group_id: Mapped[str | None] = mapped_column(String(40))
    guarantor_name: Mapped[str | None] = mapped_column(String(120))
    last_accessed_at: Mapped[datetime | None] = mapped_column(DateTime)

    diagnoses: Mapped[list["Diagnosis"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
    medications: Mapped[list["Medication"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
    allergies: Mapped[list["Allergy"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
    encounters: Mapped[list["Encounter"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )
    documents: Mapped[list["Document"]] = relationship(
        back_populates="patient", cascade="all, delete-orphan"
    )


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int | None] = mapped_column(ForeignKey("patients.id"))
    provider_id: Mapped[int | None] = mapped_column(ForeignKey("providers.id"))
    date: Mapped[date] = mapped_column(Date, index=True)
    start_time: Mapped[str] = mapped_column(String(5))  # "HH:MM" 24h
    end_time: Mapped[str] = mapped_column(String(5))
    type: Mapped[str] = mapped_column(String(60), default="Office Visit")
    status: Mapped[str] = mapped_column(String(20), default="Pending")
    chief_complaint: Mapped[str | None] = mapped_column(String(255))
    facility: Mapped[str | None] = mapped_column(String(120), default="Will Demo Practice")
    note: Mapped[str | None] = mapped_column(Text)
    is_block: Mapped[bool] = mapped_column(Boolean, default=False)
    block_reason: Mapped[str | None] = mapped_column(String(120))

    patient: Mapped[Patient | None] = relationship()


class Encounter(Base):
    __tablename__ = "encounters"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    provider_id: Mapped[int | None] = mapped_column(ForeignKey("providers.id"))
    date: Mapped[date] = mapped_column(Date)
    type: Mapped[str] = mapped_column(String(60), default="Office Visit")
    note_type: Mapped[str] = mapped_column(String(60), default="SOAP Note")
    status: Mapped[str] = mapped_column(String(20), default="Unsigned")
    facility: Mapped[str | None] = mapped_column(String(120), default="Will Demo Practice")
    chief_complaint: Mapped[str | None] = mapped_column(String(255))
    subjective: Mapped[str | None] = mapped_column(Text)
    objective: Mapped[str | None] = mapped_column(Text)
    assessment: Mapped[str | None] = mapped_column(Text)
    plan_note: Mapped[str | None] = mapped_column(Text)
    signed_at: Mapped[datetime | None] = mapped_column(DateTime)

    patient: Mapped[Patient] = relationship(back_populates="encounters")
    vitals: Mapped["Vitals | None"] = relationship(
        back_populates="encounter", cascade="all, delete-orphan", uselist=False
    )


class Vitals(Base):
    __tablename__ = "vitals"

    id: Mapped[int] = mapped_column(primary_key=True)
    encounter_id: Mapped[int] = mapped_column(
        ForeignKey("encounters.id"), unique=True, index=True
    )
    height_in: Mapped[float | None] = mapped_column(Float)
    weight_lb: Mapped[float | None] = mapped_column(Float)
    bmi: Mapped[float | None] = mapped_column(Float)
    bp_systolic: Mapped[int | None] = mapped_column(Integer)
    bp_diastolic: Mapped[int | None] = mapped_column(Integer)
    temp_f: Mapped[float | None] = mapped_column(Float)
    pulse: Mapped[int | None] = mapped_column(Integer)
    resp_rate: Mapped[int | None] = mapped_column(Integer)
    o2_sat: Mapped[int | None] = mapped_column(Integer)
    pain: Mapped[int | None] = mapped_column(Integer)

    encounter: Mapped[Encounter] = relationship(back_populates="vitals")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    icd10: Mapped[str] = mapped_column(String(10))
    description: Mapped[str] = mapped_column(String(255))
    is_chronic: Mapped[bool] = mapped_column(Boolean, default=False)

    patient: Mapped[Patient] = relationship(back_populates="diagnoses")


class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    sig: Mapped[str | None] = mapped_column(String(255))
    start_date: Mapped[date | None] = mapped_column(Date)
    stop_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="active")  # active | historical
    prescriber: Mapped[str | None] = mapped_column(String(120))

    patient: Mapped[Patient] = relationship(back_populates="medications")


class Allergy(Base):
    __tablename__ = "allergies"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    category: Mapped[str] = mapped_column(String(20))  # drug | food | environmental
    substance: Mapped[str] = mapped_column(String(120))
    reaction: Mapped[str | None] = mapped_column(String(255))

    patient: Mapped[Patient] = relationship(back_populates="allergies")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    details: Mapped[str] = mapped_column(Text)
    assignee: Mapped[str | None] = mapped_column(String(120))
    patient_id: Mapped[int | None] = mapped_column(ForeignKey("patients.id"))
    reminder_date: Mapped[date | None] = mapped_column(Date)
    task_type: Mapped[str | None] = mapped_column(String(60))
    status: Mapped[str] = mapped_column(String(20), default="incomplete")
    author: Mapped[str | None] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    patient: Mapped[Patient | None] = relationship()


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    from_user: Mapped[str] = mapped_column(String(120))
    to_user: Mapped[str] = mapped_column(String(120))
    patient_id: Mapped[int | None] = mapped_column(ForeignKey("patients.id"))
    subject: Mapped[str] = mapped_column(String(255))
    body: Mapped[str | None] = mapped_column(Text)
    urgent: Mapped[bool] = mapped_column(Boolean, default=False)
    folder: Mapped[str] = mapped_column(String(20), default="inbox")  # inbox | sent | archive
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    patient: Mapped[Patient | None] = relationship()


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    type: Mapped[str | None] = mapped_column(String(60))
    provider: Mapped[str | None] = mapped_column(String(120))
    date: Mapped[date | None] = mapped_column(Date)
    size: Mapped[str | None] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20), default="Signed")
    comments: Mapped[str | None] = mapped_column(String(255))

    patient: Mapped[Patient] = relationship(back_populates="documents")
