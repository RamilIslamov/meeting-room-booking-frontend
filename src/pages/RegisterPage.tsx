import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/auth';
import { errorMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';

interface FormValues {
  fullName: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const { register, handleSubmit, formState } = useForm<FormValues>();
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const auth = await registerApi(values.email, values.password, values.fullName);
      setSession(auth);
      navigate('/rooms');
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit(onSubmit)}>
        <h1>Create account</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <label>
          Full name
          <input type="text" {...register('fullName', { required: 'Full name is required' })} />
          {formState.errors.fullName && <span className="field-error">{formState.errors.fullName.message}</span>}
        </label>
        <label>
          Email
          <input type="email" autoComplete="username" {...register('email', { required: 'Email is required' })} />
          {formState.errors.email && <span className="field-error">{formState.errors.email.message}</span>}
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="new-password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'At least 8 characters' },
            })}
          />
          {formState.errors.password && <span className="field-error">{formState.errors.password.message}</span>}
        </label>
        <button type="submit" className="btn btn-primary" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Creating…' : 'Create account'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
