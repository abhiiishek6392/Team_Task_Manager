import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerRequest } from "../../api";
import { Alert } from "../../components";
import { ROLES } from "../../constants";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: ROLES.MEMBER
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await registerRequest({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      });

      navigate("/login");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="panel w-full max-w-md p-6">
        <div className="mb-6">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-blue-600 text-white">
            <UserPlus size={21} />
          </div>
          <p className="eyebrow">Team Task Manager</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">Join the workspace and start managing team tasks.</p>
        </div>

        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="field-label" htmlFor="name">
              Name
            </label>
            <input
              className="form-input"
              id="name"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              className="form-input"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              className="form-input"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="role">
              Role
            </label>
            <select
              className="form-input"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value={ROLES.MEMBER}>Member</option>
              <option value={ROLES.ADMIN}>Admin</option>
            </select>
          </div>

          <button
            className="primary-button w-full"
            type="submit"
            disabled={isSubmitting}
          >
            <UserPlus size={16} />
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-medium text-blue-700 hover:text-blue-800" to="/login">
            Login here
          </Link>
        </p>
      </section>
    </main>
  );
}
