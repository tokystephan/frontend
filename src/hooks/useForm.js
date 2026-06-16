import { useState } from 'react'

const useForm = (initialValues) => {
  const [values, setValues] = useState(initialValues)

  const setFieldValue = (name, value) => {
    setValues((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFieldValue(name, value)
  }

  const reset = (nextValues = initialValues) => {
    setValues(nextValues)
  }

  return {
    values,
    setValues,
    setFieldValue,
    handleChange,
    reset,
  }
}

export default useForm
