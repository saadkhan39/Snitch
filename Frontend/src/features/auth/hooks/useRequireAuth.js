import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

const useRequireAuth = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  return () => {
    if (user) {
      return true;
    }

    navigate("/login");
    return false;
  };
};

export default useRequireAuth;