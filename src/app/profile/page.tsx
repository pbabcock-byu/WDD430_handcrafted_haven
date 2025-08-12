"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "../components/LogoutButton";

interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: "user" | "seller" | "admin";
  shop_name?: string;
  bio?: string;
  profile_pic?: string;
  story?: string;
  is_active?: boolean;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  shop_name?: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  image_url: string;
  price: number | string;
  category: string;
  seller_id: number;
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<
    string | null
  >(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(
    null
  );
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState<number | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        const res = await fetch("/api/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (res.ok) {
          const data: UserProfile = await res.json();
          setUserProfile(data);
        } else {
          const errData = await res.json();
          setError(errData.message || "Failed to fetch profile data.");
          if (res.status === 401 || res.status === 403) {
            localStorage.clear();
            router.push("/login");
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  useEffect(() => {
    const fetchAdminUsers = async () => {
      if (userProfile?.role !== "admin") return;

      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        router.push("/login");
        return;
      }

      try {
        setAdminLoading(true);
        const res = await fetch("/api/admin/users", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (res.ok) {
          const data: AdminUser[] = await res.json();
          setAllUsers(data);
        } else {
          const errData = await res.json();
          setAdminError(errData.message || "Failed to fetch users.");
        }
      } catch (err) {
        console.error("Error fetching admin users:", err);
        setAdminError("An unexpected error occurred.");
      } finally {
        setAdminLoading(false);
      }
    };

    if (userProfile) fetchAdminUsers();
  }, [userProfile, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("authToken");
      const sellerId = localStorage.getItem("sellerId");
      if (!token || !sellerId) {
        console.error(
          "Missing authorization token or seller ID. User is not logged in."
        );
        return;
      }

      try {
        const response = await fetch(`/api/sellers/${sellerId}/products`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const fetchedProducts = await response.json();
          setProducts(fetchedProducts);
        } else {
          console.error(
            "Failed to fetch seller products",
            await response.text()
          );
          setProducts([]);
        }
      } catch (err) {
        console.error("An error occurred while fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    if (newPassword.length < 8) {
      setPasswordChangeError("New password must be at least 8 characters.");
      return;
    }

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/login");
      return;
    }

    try {
      setPasswordChangeLoading(true);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setPasswordChangeSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setShowPasswordForm(false);
      } else {
        const errData = await res.json();
        setPasswordChangeError(errData.message || "Failed to update password.");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setPasswordChangeError("An unexpected error occurred.");
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const handleDeleteClick = (productId: number) => {
    setProductToDeleteId(productId);
  };

  const cancelDelete = () => {
    setProductToDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (productToDeleteId === null) return;

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/login");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${productToDeleteId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== productToDeleteId));
      } else {
        const errData = await res.json();
        console.error("Failed to delete product:", errData.message);
      }
    } catch (error) {
      console.error("An error occurred while deleting the product:", error);
    } finally {
      setIsDeleting(false);
      setProductToDeleteId(null);
    }
  };

  const getProfilePicUrl = (pic?: string) => {
    if (!pic) return "/default-profile.png";
    return pic.startsWith("http")
      ? pic
      : `${process.env.NEXT_PUBLIC_BASE_URL || ""}${pic}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md">
          {error}
          <p className="mt-2 text-sm">Please log in again.</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700 text-lg">No profile data available.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Profile
        </h2>

        {/* Profile Picture */}
        <div className="flex justify-center mb-4">
          <Image
            src={getProfilePicUrl(userProfile.profile_pic)}
            alt={`${userProfile.name}'s Profile`}
            width={96}
            height={96}
            className="rounded-full object-cover"
          />
        </div>

        <p className="profile-info-item">
          <span className="info-label">Name:</span> {userProfile.name}
        </p>
        <p className="profile-info-item">
          <span className="info-label">Email:</span> {userProfile.email}
        </p>

        {/* Seller Section */}
        {userProfile.role === "seller" && (
          <div className="mt-8 border-t pt-4">
            <div className="profile-header">
              <h3 className="profile-title">My Shop</h3>
            </div>
            <div className="profile-details">
              <p className="profile-info-item">
                <span className="info-label">Shop Name:</span>
                {userProfile.shop_name || "N/A"}
              </p>
              <p className="profile-info-item">
                <span className="info-label">Bio:</span>{" "}
                {userProfile.bio || "N/A"}
              </p>
              <p className="profile-info-item">
                <span className="info-label">Story:</span>{" "}
                {userProfile.story || "N/A"}
              </p>
            </div>

            {/* Seller Products*/}
            <div className="mt-8 border-t pt-4">
              <div className="profile-header">
              <h3 className="profile-title">My Products</h3>
            </div>
              {productsLoading ? (
                <p className="text-gray-500">Loading products...</p>
              ) : products.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col">Image</th>
                        <th scope="col">Product Name</th>
                        <th scope="col">Description</th>
                        <th scope="col">Price</th>
                        <th scope="col">Category</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Image
                              src={product.image_url}
                              alt={product.title}
                              width={40}
                              height={40}
                              className="h-16 w-16 object-cover rounded-full"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.price !== null &&
                            product.price !== undefined &&
                            !isNaN(parseFloat(product.price as string))
                              ? `$${parseFloat(product.price as string).toFixed(
                                  2
                                )}`
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {productToDeleteId === product.id ? (
                              <div className="flex items-center justify-end space-x-2">
                                <span>Are you sure?</span>
                                <button
                                  onClick={handleConfirmDelete}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? "Deleting..." : "Yes"}
                                </button>
                                <button onClick={cancelDelete}>No</button>
                              </div>
                            ) : (
                              <div>
                                <a
                                  href={`/edit-product/${product.id}`}
                                  className="edit-button"
                                >
                                  Edit
                                </a>
                                <button
                                  onClick={() => handleDeleteClick(product.id)}
                                  className="delete-button"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">
                  You have no products listed yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Admin Section */}
        {userProfile.role === "admin" && (
          <div className="mt-8 border-t pt-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Admin Dashboard
            </h3>
            {adminLoading ? (
              <p>Loading users...</p>
            ) : adminError ? (
              <p className="text-red-500">{adminError}</p>
            ) : (
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Role</th>
                    <th className="p-2 border">Shop Name</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.length ? (
                    allUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="p-2 border">{u.name}</td>
                        <td className="p-2 border">{u.email}</td>
                        <td className="p-2 border">{u.role}</td>
                        <td className="p-2 border">{u.shop_name || "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Change Password */}
        <div className="password-div">
          <div className="profile-header">
              <h3 className="profile-title">Change Password</h3>
            </div>
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="update-password"
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} className="password-div">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2"
              />
              {passwordChangeError && (
                <p className="text-red-500">{passwordChangeError}</p>
              )}
              {passwordChangeSuccess && (
                <p className="text-green-500">{passwordChangeSuccess}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="delete-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordChangeLoading}
                  className="update-password"
                >
                  {passwordChangeLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </div>
        {passwordChangeSuccess && (
          <div className="p-4 mt-4 text-green-700 bg-green-100 rounded-lg">
            <p>{passwordChangeSuccess}</p>
          </div>
        )}

        {passwordChangeError && (
          <div className="p-4 mt-4 text-red-700 bg-red-100 rounded-lg">
            <p>{passwordChangeError}</p>
          </div>
        )}

        <div className="mt-8 border-t pt-4 flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
