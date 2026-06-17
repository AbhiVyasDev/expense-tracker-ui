import { Link } from "react-router-dom";

function Sidebar() {

    return (

        <div className="w-64 bg-slate-900 text-white p-5">

            <h1 className="text-2xl font-bold mb-8">

                Expense Tracker

            </h1>

            <nav className="flex flex-col gap-4">

                <Link to="/dashboard">
                    Dashboard
                </Link>

                <Link to="/expenses">
                    Expenses
                </Link>

                <Link to="/categories">
                    Categories
                </Link>

                <Link to="/budgets">
                    Budgets
                </Link>

            </nav>

        </div>
    );
}

export default Sidebar;