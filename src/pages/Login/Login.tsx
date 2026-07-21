import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import InputField from "../../components/CommonInput";
import { clearAuthError, loginUser } from "../../store/slice/authSlice";
import { addToast } from "../../store/slice/uiSlice";
import Button from "../../components/Button";

function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, message, error } = useAppSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    await dispatch(
      loginUser({
        email: formData.email,
        password: formData.password,
      })
    );
  };

  useEffect(() => {
    if (message) {
      dispatch(
        addToast({
          type: "success",
          text: message,
        })
      );
      navigate("/");
      dispatch(clearAuthError());
    }

    if (error) {
      dispatch(
        addToast({
          type: "error",
          text: error,
        })
      );
      dispatch(clearAuthError());
    }
  }, [message, error, dispatch, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945')] bg-cover bg-center" />

      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
      <div className="relative z-10 w-full max-w-lg px-5">
        <div className="rounded-xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 flex flex-col items-center">
            <h1 className="text-2xl font-bold text-white">
              Villa Admin
            </h1>
            <p className="mt-1 text-center text-sm text-slate-300 capitalize">
              Sign in to manage villas, bookings and guests
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <InputField
                type="email"
                name="email"
                placeholder="admin@example.com"
                className=" text-white"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <div className="relative">
                <InputField
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  className=" text-white"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              full
              leftIcon={!isLoading ? <LogIn size={18} /> : undefined}
              disabled={isLoading}
              className="flex items-center justify-center py-3 text-base font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  login In...
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;