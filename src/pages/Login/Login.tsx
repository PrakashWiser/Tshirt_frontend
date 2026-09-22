import { useEffect, useState } from "react";
import { LogIn, Shirt } from "lucide-react";
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f3ee]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.2),transparent_38%),linear-gradient(135deg,_#fff7ed_0%,_#fff_35%,_#f9fafb_100%)]" />

      <div className="relative z-10 w-full max-w-xl px-5">
        <div className="rounded-[28px] border border-orange-100 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl ring-1 ring-slate-200">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#111827] text-orange-400 shadow-lg shadow-orange-200/80">
              <Shirt size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Tshirt Admin
            </h1>
            <p className="mt-2 text-center text-sm text-slate-600">
              Manage products, orders, customers and store performance
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <InputField
                type="email"
                name="email"
                placeholder="admin@tshirtstore.com"
                className="text-slate-900"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <InputField
                type="password"
                name="password"
                placeholder="Enter password"
                className="text-slate-900"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <Button
              type="submit"
              full
              leftIcon={!isLoading ? <LogIn size={18} /> : undefined}
              disabled={isLoading}
              className="flex items-center justify-center bg-[#111827] py-3 text-base font-semibold text-white hover:bg-[#1f2937]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Logging in...
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