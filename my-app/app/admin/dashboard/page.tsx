"use client";
import ProtectedRoute from "@/app/components/protectedRoute.tsx/protectedRoute";
import { client } from "@/sanity/lib/client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaTrash, FaCheck, FaTruck, FaTimes } from "react-icons/fa";

interface CartItem {
  product: {
    _id: string;
    title: string;
    imageUrl?: string;
  };
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
          cartItems[] {
            product->{
              _id,
              title,
              "imageUrl": image.asset->url
            }
          }
        }`
      )
      .then((data) => {
        console.log("Fetched Orders:", data); // Debugging log
        setOrders(data);
      })
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const filterOrders =
    filter === "All" ? orders : orders.filter((order) => order.status === filter);

  const handleOrderAction = (action: string, orderId: string) => {
    // Handle success, dispatch, or delete actions
    switch (action) {
      case "success":
        // Handle success action
        updateOrderStatus(orderId, "success");
        break;
      case "dispatch":
        // Handle dispatch action
        updateOrderStatus(orderId, "dispatch");
        break;
      case "delete":
        // Handle delete action
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
        // Update the local state to reflect the change
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
        <aside className="w-64 bg-red-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
          <div className="space-y-3">
            {["All", "pending", "success", "dispatch"].map((status) => (
              <button
                key={status}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === status ? "bg-white text-red-600 font-bold" : "text-white hover:bg-red-500"
                }`}
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Orders</h2>
          <div className="overflow-y-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filterOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-100 cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">{order._id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.firstName} {order.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">${order.total}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click event from firing
                          handleOrderAction("success", order._id);
                        }}
                        className="text-green-500 hover:text-green-700 mx-2"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click event from firing
                          handleOrderAction("dispatch", order._id);
                        }}
                        className="text-blue-500 hover:text-blue-700 mx-2"
                      >
                        <FaTruck />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click event from firing
                          handleOrderAction("delete", order._id);
                        }}
                        className="text-red-500 hover:text-red-700 mx-2"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full md:w-1/2 lg:w-1/3">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Order Details</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    <FaTimes />
                  </button>
                </div>
                <p>
                  <strong>Customer:</strong> {selectedOrder.firstName} {selectedOrder.lastName}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedOrder.phone}
                </p>
                <p>
                  <strong>Email:</strong> {selectedOrder.email}
                </p>
                <p>
                  <strong>Address:</strong> {selectedOrder.address}, {selectedOrder.city},{" "}
                  {selectedOrder.zipCode}
                </p>
                <p>
                  <strong>Total:</strong> ${selectedOrder.total}
                </p>
                <h3 className="text-lg font-semibold mt-4">Ordered Products:</h3>

                <div className="flex flex-wrap gap-4 mt-2">
                  {selectedOrder.cartItems?.length > 0 ? (
                    selectedOrder.cartItems.map((item, index) => (
                      <div
                        key={index}
                        className="w-24 h-24 border rounded-lg overflow-hidden shadow-sm"
                      >
                        {item.product?.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product?.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                            No Image
                          </div>
                        )}
                        <p className="text-xs text-center mt-1">{item.product?.title || "No Title"}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No products found</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
