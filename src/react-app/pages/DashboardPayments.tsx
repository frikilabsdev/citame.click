import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Wallet,
  Building2,
} from "lucide-react";
import type { Tenant, PaymentMethod } from "@/shared/types";

const PAYMENT_METHODS = [
  { value: "cash", label: "Efectivo", icon: <Wallet className="w-5 h-5" /> },
  {
    value: "transfer",
    label: "Transferencia Bancaria",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    value: "card",
    label: "Tarjeta de Crédito",
    icon: <CreditCard className="w-5 h-5" />,
  },
];

export default function DashboardPaymentsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newMethod, setNewMethod] = useState("");
  const [formData, setFormData] = useState<
    {
      [key: number]: {
        account_number: string | null;
        clabe: string | null;
        card_number: string | null;
        account_holder_name: string | null;
        is_active: boolean;
      };
    }
  >({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchPaymentMethods();
    }
  }, [selectedTenant]);

  const fetchTenants = async () => {
    try {
      const response = await fetch("/api/tenants");
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
        if (data.length > 0) {
          setSelectedTenant(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error al cargar negocios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    if (!selectedTenant) return;

    try {
      const response = await fetch(`/api/payments?tenant_id=${selectedTenant}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);

        const initialFormData: {
          [key: number]: {
            account_number: string | null;
            clabe: string | null;
            card_number: string | null;
            account_holder_name: string | null;
            is_active: boolean;
          };
        } = {};
        data.forEach((method: PaymentMethod) => {
          initialFormData[method.id] = {
            account_number: method.account_number || null,
            clabe: method.clabe || null,
            card_number: method.card_number || null,
            account_holder_name: method.account_holder_name || null,
            is_active: method.is_active,
          };
        });
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error("Error al cargar métodos de pago:", error);
    }
  };

  const handleCreate = async () => {
    if (!selectedTenant || !newMethod) return;

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: selectedTenant,
          method_type: newMethod,
          is_active: false,
        }),
      });

      if (response.ok) {
        setNewMethod("");
        await fetchPaymentMethods();
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        const error = await response.json();
        alert(error.error || "Error al crear método de pago");
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error al crear método de pago:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData[id]) return;

    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData[id]),
      });

      if (response.ok) {
        setEditingId(null);
        await fetchPaymentMethods();
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error al actualizar método de pago:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este método de pago?")) {
      return;
    }

    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchPaymentMethods();
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("Error al eliminar método de pago:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const getMethodInfo = (methodType: string) => {
    return (
      PAYMENT_METHODS.find((m) => m.value === methodType) || {
        value: methodType,
        label: methodType,
        icon: <CreditCard className="w-5 h-5" />,
      }
    );
  };

  const availableMethods = PAYMENT_METHODS.filter(
    (m) => !paymentMethods.some((pm) => pm.method_type === m.value)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            No tienes negocios creados
          </h2>
          <p className="text-slate-600 mb-6">
            Crea un negocio primero para poder configurar métodos de pago
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Métodos de Pago</h2>
          <p className="text-slate-600 mt-1">
            Gestiona los métodos de pago aceptados
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tenants.length > 1 && (
            <select
              value={selectedTenant || ""}
              onChange={(e) => setSelectedTenant(parseInt(e.target.value))}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  /{tenant.slug}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Save status */}
      {saveStatus !== "idle" && (
        <div
          className={`rounded-xl p-4 flex items-center space-x-3 ${
            saveStatus === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {saveStatus === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span
            className={`font-medium ${
              saveStatus === "success" ? "text-green-800" : "text-red-800"
            }`}
          >
            {saveStatus === "success"
              ? "Cambios guardados correctamente"
              : "Error al guardar los cambios"}
          </span>
        </div>
      )}

      {/* Add new method */}
      {availableMethods.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Agregar Método de Pago
          </h3>
          <div className="flex items-center gap-3">
            <select
              value={newMethod}
              onChange={(e) => setNewMethod(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            >
              <option value="">Selecciona un método de pago</option>
              {availableMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreate}
              disabled={!newMethod}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar</span>
            </button>
          </div>
        </div>
      )}

      {/* Payment methods list */}
      {paymentMethods.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            No hay métodos de pago configurados
          </h3>
          <p className="text-slate-600">
            Agrega los métodos de pago que aceptas para que tus clientes sepan
            cómo pagar
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method) => {
            const methodInfo = getMethodInfo(method.method_type);
            const isEditing = editingId === method.id;
            const isTransfer = method.method_type === "transfer";

            return (
              <div
                key={method.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      {methodInfo.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {methodInfo.label}
                      </h3>
                      <span
                        className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                          method.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {method.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleUpdate(method.id)}
                          className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="Guardar"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            fetchPaymentMethods();
                          }}
                          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingId(method.id)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(method.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-4 mt-4 pt-4 border-t border-slate-200">
                    {isTransfer && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Número de Cuenta
                          </label>
                          <input
                            type="text"
                            value={formData[method.id]?.account_number || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [method.id]: {
                                  ...formData[method.id],
                                  account_number: e.target.value || null,
                                },
                              })
                            }
                            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="1234567890"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            CLABE
                          </label>
                          <input
                            type="text"
                            value={formData[method.id]?.clabe || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [method.id]: {
                                  ...formData[method.id],
                                  clabe: e.target.value || null,
                                },
                              })
                            }
                            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="012345678901234567"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Número de Tarjeta
                          </label>
                          <input
                            type="text"
                            value={formData[method.id]?.card_number || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [method.id]: {
                                  ...formData[method.id],
                                  card_number: e.target.value || null,
                                },
                              })
                            }
                            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Nombre del Receptor
                          </label>
                          <input
                            type="text"
                            value={formData[method.id]?.account_holder_name || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [method.id]: {
                                  ...formData[method.id],
                                  account_holder_name: e.target.value || null,
                                },
                              })
                            }
                            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="Juan Pérez"
                          />
                        </div>
                      </>
                    )}
                    <div className="flex items-center space-x-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData[method.id]?.is_active || false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [method.id]: {
                                ...formData[method.id],
                                is_active: e.target.checked,
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-slate-700">
                          Método activo (visible para clientes)
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  isTransfer && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-sm text-slate-600">
                      {method.account_number && (
                        <div>
                          <span className="font-semibold">Número de Cuenta:</span>{" "}
                          {method.account_number}
                        </div>
                      )}
                      {method.clabe && (
                        <div>
                          <span className="font-semibold">CLABE:</span> {method.clabe}
                        </div>
                      )}
                      {method.card_number && (
                        <div>
                          <span className="font-semibold">Tarjeta:</span>{" "}
                          {method.card_number}
                        </div>
                      )}
                      {method.account_holder_name && (
                        <div>
                          <span className="font-semibold">Receptor:</span>{" "}
                          {method.account_holder_name}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
