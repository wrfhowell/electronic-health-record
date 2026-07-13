import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { api } from './client'
import type {
  Appointment,
  Encounter,
  Message,
  Patient,
  PatientCreate,
  PatientSummary,
  Task,
  Vitals,
  VitalsIn,
} from './types'

// ---------- Patients ----------

export function usePatients(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : ''
  return useQuery({
    queryKey: ['patients', search ?? ''],
    queryFn: () => api.get<Patient[]>(`/api/patients${qs}`),
  })
}

export function usePatientSummary(patientId: number | undefined) {
  return useQuery({
    queryKey: ['patient-summary', patientId],
    queryFn: () => api.get<PatientSummary>(`/api/patients/${patientId}/summary`),
    enabled: patientId !== undefined,
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<PatientCreate>) =>
      api.post<Patient>('/api/patients', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}

export function useUpdatePatient(patientId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<PatientCreate>) =>
      api.put<Patient>(`/api/patients/${patientId}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      qc.invalidateQueries({ queryKey: ['patient-summary', patientId] })
    },
  })
}

// ---------- Appointments ----------

export function useAppointments(start: string, end: string) {
  return useQuery({
    queryKey: ['appointments', start, end],
    queryFn: () =>
      api.get<Appointment[]>(`/api/appointments?start=${start}&end=${end}`),
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post<Appointment>('/api/appointments', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useUpdateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Record<string, unknown>) =>
      api.put<Appointment>(`/api/appointments/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useDeleteAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/api/appointments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

// ---------- Encounters ----------

export function useEncounter(encounterId: number | undefined) {
  return useQuery({
    queryKey: ['encounter', encounterId],
    queryFn: () => api.get<Encounter>(`/api/encounters/${encounterId}`),
    enabled: encounterId !== undefined,
  })
}

function invalidateEncounter(
  qc: ReturnType<typeof useQueryClient>,
  enc: { id: number; patient_id: number },
) {
  qc.invalidateQueries({ queryKey: ['encounter', enc.id] })
  qc.invalidateQueries({ queryKey: ['patient-summary', enc.patient_id] })
}

export function useCreateEncounter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post<Encounter>('/api/encounters', payload),
    onSuccess: (enc) => invalidateEncounter(qc, enc),
  })
}

export function useUpdateEncounter(encounterId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.put<Encounter>(`/api/encounters/${encounterId}`, payload),
    onSuccess: (enc) => invalidateEncounter(qc, enc),
  })
}

export function useSignEncounter(encounterId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<Encounter>(`/api/encounters/${encounterId}/sign`, {}),
    onSuccess: (enc) => invalidateEncounter(qc, enc),
  })
}

export function useSaveVitals(encounterId: number, patientId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: VitalsIn) =>
      api.put<Vitals>(`/api/encounters/${encounterId}/vitals`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['encounter', encounterId] })
      qc.invalidateQueries({ queryKey: ['patient-summary', patientId] })
    },
  })
}

// ---------- Tasks ----------

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get<Task[]>('/api/tasks'),
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post<Task>('/api/tasks', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Record<string, unknown>) =>
      api.put<Task>(`/api/tasks/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

// ---------- Messages ----------

export function useMessages(folder: string) {
  return useQuery({
    queryKey: ['messages', folder],
    queryFn: () => api.get<Message[]>(`/api/messages?folder=${folder}`),
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post<Message>('/api/messages', payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  })
}

export function useUpdateMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Record<string, unknown>) =>
      api.put<Message>(`/api/messages/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
  })
}
