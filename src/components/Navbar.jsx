import { useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const logout = () => {

        localStorage.removeItem(
                "token"
        );

        navigate("/");
    };

    return (

        <div
            className="
                bg-white
                shadow
                p-4
                flex
                justify-end
            "
        >

            <button
                onClick={logout}
                className="
                    bg-red-500
                    text-white
                    px-4
                    py-2
                    rounded
                "
            >
                Logout
            </button>

        </div>
    );
}

export default Navbar;