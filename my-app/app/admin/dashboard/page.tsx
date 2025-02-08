"use client";

import { client } from "@/sanity/lib/client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaTrash, FaCheck, FaTruck, FaTimes, FaBars } from "react-icons/fa";
import ProtectedRoute from "@/app/components/protectedRoute";

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
  imageUrl: string;
  cartItems: CartItem[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    client
      .fetch(
        `*[_type == "order"]{
          _id,
          firstName,
          lastName,
          phone,
          email,
          address,
          city,
          zipCode,
          orderDate,
          status,
          total,
          cartItems[]-> {
              _id,
              title,
              "imageUrl": image.asset->url
            }
        }`
      )
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const filterOrders =
    filter === "All" ? orders : orders.filter((order) => order.status === filter);

  const handleOrderAction = (action: string, orderId: string) => {
    switch (action) {
      case "success":
        updateOrderStatus(orderId, "success");
        break;
      case "dispatch":
        updateOrderStatus(orderId, "dispatch");
        break;
      case "delete":
        deleteOrder(orderId);
        break;
      default:
        break;
    }
  };

  const updateOrderStatus = (orderId: string, status: string) => {
    client
      .patch(orderId)
      .set({ status })
      .commit()
      .then(() => {
        Swal.fire("Success", "Order status updated", "success");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status } : order
          )
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
      cancelButtonText: "No, keep it",
    }).then((result) => {
      if (result.isConfirmed) {
        client
          .delete(orderId)
          .then(() => {
            Swal.fire("Deleted!", "Your order has been deleted.", "success");
            setOrders((prevOrders) =>
              prevOrders.filter((order) => order._id !== orderId)
            );
          })
          .catch((error) => console.error("Error deleting order:", error));
      }
    });
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside
          className={`fixed md:relative w-64 bg-red-600 text-white p-6 transition-transform transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-64"
          } md:translate-x-0`}
        >
          <button
            className="md:hidden absolute top-4 right-4 text-white text-2xl"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaTimes />
          </button>
          <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
          <div className="space-y-3">
            {["All", "pending", "success", "dispatch"].map((status) => (
              <button
                key={status}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === status ? "bg-white text-red-600 font-bold" : "text-white hover:bg-red-500"
                }`}
                onClick={() => {
                  setFilter(status);
                  setIsSidebarOpen(false);
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Orders</h2>
            <button className="md:hidden text-2xl text-red-600" onClick={() => setIsSidebarOpen(true)}>
              <FaBars />
            </button>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filterOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 text-sm text-black">{order._id}</td>
                    <td className="px-4 py-2 text-sm text-black">
                      {order.firstName} {order.lastName}
                    </td>
                    <td className="px-4 py-2 text-sm text-black">${order.total}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        order.status === "success" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm flex space-x-2">
                      <button className="text-green-500 hover:text-green-700"><FaCheck /></button>
                      <button className="text-blue-500 hover:text-blue-700"><FaTruck /></button>
                      <button className="text-red-500 hover:text-red-700"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
