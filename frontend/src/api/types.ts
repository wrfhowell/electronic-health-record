export interface Patient {
  id: number
  first_name: string
  last_name: string
  prn: string
  dob: string
  sex: string
  phone_mobile: string | null
  phone_home: string | null
  phone_work: string | null
  email: string | null
  address_street: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  status: string
  insurance_payer: string | null
  insurance_plan: string | null
  insurance_member_id: string | null
  insurance_group_id: string | null
  guarantor_name: string | null
  last_accessed_at: string | null
}

export type PatientCreate = Omit<Patient, 'id' | 'prn' | 'last_accessed_at'> & {
  prn?: string | null
}

export interface Diagnosis {
  id: number
  patient_id: number
  icd10: string
  description: string
  is_chronic: boolean
}

export interface Medication {
  id: number
  patient_id: number
  name: string
  sig: string | null
  start_date: string | null
  stop_date: string | null
  status: string
  prescriber: string | null
}

export interface Allergy {
  id: number
  patient_id: number
  category: string
  substance: string
  reaction: string | null
}

export interface Vitals {
  id: number
  encounter_id: number
  height_in: number | null
  weight_lb: number | null
  bmi: number | null
  bp_systolic: number | null
  bp_diastolic: number | null
  temp_f: number | null
  pulse: number | null
  resp_rate: number | null
  o2_sat: number | null
  pain: number | null
}

export type VitalsIn = Partial<Omit<Vitals, 'id' | 'encounter_id' | 'bmi'>>

export interface Encounter {
  id: number
  patient_id: number
  provider_id: number | null
  date: string
  type: string
  note_type: string
  status: string
  facility: string | null
  chief_complaint: string | null
  subjective: string | null
  objective: string | null
  assessment: string | null
  plan_note: string | null
  signed_at: string | null
  vitals: Vitals | null
}

export interface Document {
  id: number
  patient_id: number
  title: string
  type: string | null
  provider: string | null
  date: string | null
  size: string | null
  status: string
  comments: string | null
}

export interface PatientSummary {
  patient: Patient
  diagnoses: Diagnosis[]
  medications: Medication[]
  allergies: Allergy[]
  encounters: Encounter[]
  documents: Document[]
  vitals_history: Vitals[]
}

export interface Appointment {
  id: number
  patient_id: number | null
  provider_id: number | null
  date: string
  start_time: string
  end_time: string
  type: string
  status: string
  chief_complaint: string | null
  facility: string | null
  note: string | null
  is_block: boolean
  block_reason: string | null
  patient: Patient | null
}

export interface Task {
  id: number
  details: string
  assignee: string | null
  patient_id: number | null
  reminder_date: string | null
  task_type: string | null
  status: string
  author: string | null
  created_at: string
  patient: Patient | null
}

export interface Message {
  id: number
  from_user: string
  to_user: string
  patient_id: number | null
  subject: string
  body: string | null
  urgent: boolean
  folder: string
  read: boolean
  created_at: string
  patient: Patient | null
}
