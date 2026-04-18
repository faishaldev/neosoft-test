import type { FormEvent } from 'react'
import type { ProductFieldErrors } from '../lib/master/formErrors'

export type { ProductFieldErrors }

type Props = {
  name: string
  price: string
  errors: ProductFieldErrors
  onNameChange: (v: string) => void
  onPriceChange: (v: string) => void
  onSubmit: (e: FormEvent) => void
}

export function ProductAddForm({
  name,
  price,
  errors,
  onNameChange,
  onPriceChange,
  onSubmit,
}: Props) {
  return (
    <form className="form-card no-print" onSubmit={onSubmit} noValidate>
      <div className="form-card__fields form-row form-row--balanced">
        <label className="field">
          <span>Nama barang</span>
          <input
            id="product-name"
            autoComplete="off"
            value={name}
            onChange={(ev) => onNameChange(ev.target.value)}
            placeholder="Contoh: Vitamin C"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'err-product-name' : undefined}
          />
          {errors.name ? (
            <span id="err-product-name" className="sr-only">
              {errors.name}
            </span>
          ) : null}
        </label>
        <label className="field">
          <span>Harga (Rp)</span>
          <input
            id="product-price"
            inputMode="numeric"
            autoComplete="off"
            value={price}
            onChange={(ev) => onPriceChange(ev.target.value)}
            placeholder="mis. 150000"
            aria-invalid={Boolean(errors.price)}
            aria-describedby={errors.price ? 'err-product-price' : undefined}
          />
          {errors.price ? (
            <span id="err-product-price" className="sr-only">
              {errors.price}
            </span>
          ) : null}
        </label>
        <div className="form-row__action">
          <span className="form-row__action-spacer" aria-hidden="true">
            &nbsp;
          </span>
          <button type="submit" className="btn btn--primary">
            Tambah barang
          </button>
        </div>
      </div>
    </form>
  )
}
