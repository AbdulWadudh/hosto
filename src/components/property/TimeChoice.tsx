export type Choice = { id: string; label: string; time: string }

export function TimeChoice({
  name,
  legend,
  choices,
  defaultTime,
}: {
  name: string
  legend: string
  choices: readonly Choice[]
  defaultTime: string
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="mb-1.5 font-medium text-sm">{legend}</legend>
      <div className="flex gap-1 rounded-(--radius-2xl) border p-1">
        {choices.map((choice) => (
          <label key={choice.id} className="flex-1">
            <input
              type="radio"
              name={name}
              value={choice.time}
              defaultChecked={choice.time === defaultTime}
              className="peer sr-only"
            />
            <span className="block cursor-pointer rounded-(--radius-xl) px-2 py-1.5 text-center text-muted-foreground text-xs transition-colors hover:bg-muted peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
              {choice.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
