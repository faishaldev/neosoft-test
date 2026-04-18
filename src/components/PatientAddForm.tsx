import type { FormEvent } from 'react'
import type { PatientFieldErrors } from '../lib/master/formErrors'

export type { PatientFieldErrors }

type Props = {
  name: string
  phone: string
  errors: PatientFieldErrors
  onNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onSubmit: (e: FormEvent) => void
}

export function PatientAddForm({
  name,
  phone,
  errors,
  onNameChange,
  onPhoneChange,
  onSubmit,
}: Props) {
  return (
    <form className="form-card no-print" onSubmit={onSubmit} noValidate>
      <div className="form-card__fields form-row form-row--balanced">
        <label className="field">
          <span>Nama pasien</span>
          <input
            id="patient-name"
            autoComplete="name"
            value={name}
            onChange={(ev) => onNameChange(ev.target.value)}
            placeholder="Nama lengkap"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'err-patient-name' : undefined}
          />
          {errors.name ? (
            <span id="err-patient-name" className="sr-only">
              {errors.name}
            </span>
          ) : null}
        </label>
        <label className="field">
          <span>Telepon</span>
          <input
            id="patient-phone"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(ev) => onPhoneChange(ev.target.value)}
            placeholder="08xxxxxxxxxx (opsional)"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'err-patient-phone' : undefined}
          />
          {errors.phone ? (
            <span id="err-patient-phone" className="sr-only">
              {errors.phone}
            </span>
          ) : null}
        </label>
        <div className="form-row__action">
          <span className="form-row__action-spacer" aria-hidden="true">
            &nbsp;
          </span>
          <button type="submit" className="btn btn--primary">
            Tambah pasien
          </button>
        </div>
      </div>
    </form>
  )
}
