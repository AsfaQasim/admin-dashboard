"use client";

import { client } from "@/sanity/lib/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FaTrash, FaCheck, FaTruck } from "react-icons/fa";

interface CartItem {
  _id: string;
  title: string;
  imageUrl?: string;
}

interface Order {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  zipCode: string;
  total: number;
  orderDate: string;
  status: string | null;
  city: string;
  cartItems: CartItem[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("All");
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    client
      .fetch(
        `*[_type == "order"]{
          _id, firstName, lastName, phone, email, address, city, zipCode,
          orderDate, status, total, cartItems[]-> { _id, title, "imageUrl": image.asset->url }
        }`
      )
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const filterOrders = filter === "All" ? orders : orders.filter((order) => order.status === filter);

  const updateOrderStatus = (orderId: string, status: string) => {
    client
      .patch(orderId)
      .set({ status })
      .commit()
      .then(() => {
        Swal.fire("Success", "Order status updated", "success");
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order._id === orderId ? { ...order, status } : order))
        );
      })
      .catch((error) => console.error("Error updating order status:", error));
  };

  const deleteOrder = (orderId: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        client
          .delete(orderId)
          .then(() => {
            Swal.fire("Deleted!", "Your order has been deleted.", "success");
            setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
          })
          .catch((error) => console.error("Error deleting order:", error));
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-red-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
        <div className="space-y-3">
          {["All", "pending", "success", "dispatch"].map((status) => (
            <button
              key={status}
              className={`block w-full px-4 py-2 rounded-lg text-sm transition-all ${
                filter === status ? "bg-white text-red-600 font-bold" : "hover:bg-red-500"
              }`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Orders</h2>
        <div className="overflow-y-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filterOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-100">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.firstName} {order.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">${order.total}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-green-500 mx-2" onClick={() => updateOrderStatus(order._id, "success")}>
                      <FaCheck />
                    </button>
                    <button className="text-blue-500 mx-2" onClick={() => updateOrderStatus(order._id, "dispatch")}>
                      <FaTruck />
                    </button>
                    <button className="text-red-500 mx-2" onClick={() => deleteOrder(order._id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
