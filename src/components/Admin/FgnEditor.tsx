import React, { useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { FGNData, FGNTenure } from "../../types";

const FGNEditor: React.FC = () => {
  // Initialize with three default tenures for each
  const defaultTenures: FGNTenure[] = [
    { days: 91, rate: 0, label: "91-DAY" },
    { days: 182, rate: 0, label: "182-DAY" },
    { days: 364, rate: 0, label: "364-DAY" },
  ];

  const [fgnBonds, setFgnBonds] = useState<FGNData>({
    type: "BONDS",
    tenures: [...defaultTenures],
  });

  const [fgnTBills, setFgnTBills] = useState<FGNData>({
    type: "T-BILLS",
    tenures: [...defaultTenures],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "";
  }>({
    text: "",
    type: "",
  });

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      try {
        // Fetch FGN Bonds
        const bondsRef = doc(db, "fixedIncome", "bonds");
        const bondsSnapshot = await getDoc(bondsRef);

        if (bondsSnapshot.exists()) {
          setFgnBonds(bondsSnapshot.data() as FGNData);
        }

        // Fetch FGN T-Bills
        const tbillsRef = doc(db, "fixedIncome", "tbills");
        const tbillsSnapshot = await getDoc(tbillsRef);

        if (tbillsSnapshot.exists()) {
          setFgnTBills(tbillsSnapshot.data() as FGNData);
        }
      } catch (error) {
        console.error("Error fetching fixed income data:", error);
        setMessage({
          text: "Failed to load fixed income data",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBondsTenureChange = (
    index: number,
    field: keyof FGNTenure,
    value: string | number
  ): void => {
    const newTenures = [...fgnBonds.tenures];

    if (field === "rate" || field === "days") {
      newTenures[index][field] =
        typeof value === "string" ? parseFloat(value) || 0 : value;
    } else {
      newTenures[index][field] = value.toString();
    }

    setFgnBonds({
      ...fgnBonds,
      tenures: newTenures,
    });
  };

  const handleTBillsTenureChange = (
    index: number,
    field: keyof FGNTenure,
    value: string | number
  ): void => {
    const newTenures = [...fgnTBills.tenures];

    if (field === "rate" || field === "days") {
      newTenures[index][field] =
        typeof value === "string" ? parseFloat(value) || 0 : value;
    } else {
      newTenures[index][field] = value.toString();
    }

    setFgnTBills({
      ...fgnTBills,
      tenures: newTenures,
    });
  };

  const addBondsTenure = (): void => {
    setFgnBonds({
      ...fgnBonds,
      tenures: [...fgnBonds.tenures, { days: 0, rate: 0, label: "NEW-DAY" }],
    });
  };

  const removeBondsTenure = (index: number): void => {
    const newTenures = [...fgnBonds.tenures];
    newTenures.splice(index, 1);

    setFgnBonds({
      ...fgnBonds,
      tenures: newTenures,
    });
  };

  const addTBillsTenure = (): void => {
    setFgnTBills({
      ...fgnTBills,
      tenures: [...fgnTBills.tenures, { days: 0, rate: 0, label: "NEW-DAY" }],
    });
  };

  const removeTBillsTenure = (index: number): void => {
    const newTenures = [...fgnTBills.tenures];
    newTenures.splice(index, 1);

    setFgnTBills({
      ...fgnTBills,
      tenures: newTenures,
    });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update FGN Bonds
      await setDoc(doc(db, "fixedIncome", "bonds"), {
        ...fgnBonds,
        type: "BONDS",
      });

      // Update FGN T-Bills
      await setDoc(doc(db, "fixedIncome", "tbills"), {
        ...fgnTBills,
        type: "T-BILLS",
      });

      setMessage({
        text: "Fixed income data saved successfully!",
        type: "success",
      });

      setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error saving fixed income data:", error);
      setMessage({
        text: "Failed to save fixed income data",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading fixed income data...</div>;
  }

  return (
    <div className="bg-white rounded-[30px] shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Edit Fixed Income Market</h2>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* FGN Bonds */}
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">FGN Bonds</h3>
              <button
                type="button"
                onClick={addBondsTenure}
                className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                + Add Tenure
              </button>
            </div>

            <div className="space-y-6">
              {fgnBonds.tenures.map((tenure, index) => (
                <div
                  key={index}
                  className="p-3 border rounded bg-gray-50 relative"
                >
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeBondsTenure(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor={`bonds-label-${index}`}
                      >
                        Tenure Label
                      </label>
                      <input
                        type="text"
                        id={`bonds-label-${index}`}
                        value={tenure.label}
                        onChange={(e) =>
                          handleBondsTenureChange(
                            index,
                            "label",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor={`bonds-days-${index}`}
                      >
                        Days
                      </label>
                      <input
                        type="number"
                        id={`bonds-days-${index}`}
                        value={tenure.days}
                        onChange={(e) =>
                          handleBondsTenureChange(index, "days", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor={`bonds-rate-${index}`}
                      >
                        Rate
                      </label>
                      <input
                        type="number"
                        id={`bonds-rate-${index}`}
                        value={tenure.rate}
                        onChange={(e) =>
                          handleBondsTenureChange(index, "rate", e.target.value)
                        }
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FGN T-Bills */}
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">FGN T-Bills</h3>
              <button
                type="button"
                onClick={addTBillsTenure}
                className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                + Add Tenure
              </button>
            </div>

            <div className="space-y-6">
              {fgnTBills.tenures.map((tenure, index) => (
                <div
                  key={index}
                  className="p-3 border rounded bg-gray-50 relative"
                >
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeTBillsTenure(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor={`tbills-label-${index}`}
                      >
                        Tenure Label
                      </label>
                      <input
                        type="text"
                        id={`tbills-label-${index}`}
                        value={tenure.label}
                        onChange={(e) =>
                          handleTBillsTenureChange(
                            index,
                            "label",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor={`tbills-days-${index}`}
                      >
                        Days
                      </label>
                      <input
                        type="number"
                        id={`tbills-days-${index}`}
                        value={tenure.days}
                        onChange={(e) =>
                          handleTBillsTenureChange(
                            index,
                            "days",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor={`tbills-rate-${index}`}
                      >
                        Rate
                      </label>
                      <input
                        type="number"
                        id={`tbills-rate-${index}`}
                        value={tenure.rate}
                        onChange={(e) =>
                          handleTBillsTenureChange(
                            index,
                            "rate",
                            e.target.value
                          )
                        }
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
            saving ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default FGNEditor;
