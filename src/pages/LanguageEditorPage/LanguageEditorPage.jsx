import React, { useState, useEffect } from "react";
import TextEditor from "../../components/TextEditor/TextEditor";
import "./LanguageEditorPage.css";

const LanguageEditorPage = () => {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [activeTab, setActiveTab] = useState("english"); // Default to English tab

  const token =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwcC5raHJiLnFhL2FwaS9hZG1pbi9hdXRoL2xvZ2luIiwiaWF0IjoxNzQzNzcxNTE0LCJleHAiOjE3NDYzNjM1MTQsIm5iZiI6MTc0Mzc3MTUxNCwianRpIjoib0FNU0pseDRaU2YyYU15OCIsInN1YiI6IjEiLCJwcnYiOiJkZjg4M2RiOTdiZDA1ZWY4ZmY4NTA4MmQ2ODZjNDVlODMyZTU5M2E5Iiwicm9sZSI6IjIifQ.rjuqACX2y-2_CayN93rsyN_Qky_B56dUou3FDczMQDc";

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);

        const response = await fetch("https://app.khrb.qa/api/admin/page/1", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === "success") {
          setPageData(result.data);
        } else {
          throw new Error("Failed to fetch page data");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching page data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  const handleEnglishContentChange = (html) => {
    if (pageData) {
      setPageData({
        ...pageData,
        content_en: html,
      });
    }
  };

  const handleArabicContentChange = (html) => {
    if (pageData) {
      setPageData({
        ...pageData,
        content_ar: html,
      });
    }
  };

  const handleSave = async () => {
    if (!pageData) return;

    try {
      setSaving(true);
      setSaveStatus("Saving...");

      const response = await fetch(
        "https://app.khrb.qa/api/admin/page/1/update",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title_en: pageData.title_en,
            content_en: pageData.content_en,
            title_ar: pageData.title_ar,
            content_ar: pageData.content_ar,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Save response:", result);

      if (result.status === "success") {
        setSaveStatus("Saved successfully!");
        setTimeout(() => setSaveStatus(""), 3000);
      } else {
        throw new Error(result.message || "Failed to save page data");
      }
    } catch (err) {
      setSaveStatus(`Error: ${err.message}`);
      console.error("Error saving page data:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!pageData) {
    return <div className="no-data">No data available</div>;
  }

  return (
    <div className="language-editor-page">
      <div className="language-tabs">
        <button
          className={`tab-button ${activeTab === "english" ? "active" : ""}`}
          onClick={() => setActiveTab("english")}
        >
          English
        </button>
        <button
          className={`tab-button ${activeTab === "arabic" ? "active" : ""}`}
          onClick={() => setActiveTab("arabic")}
        >
          Arabic
        </button>
      </div>

      <div className="editor-container">
        {activeTab === "english" && (
          <div className="editor-wrapper">
            <TextEditor
              initialContent={pageData.content_en}
              onUpdate={handleEnglishContentChange}
              direction="ltr"
            />
          </div>
        )}

        {activeTab === "arabic" && (
          <div className="editor-wrapper">
            <TextEditor
              initialContent={pageData.content_ar}
              onUpdate={handleArabicContentChange}
              direction="rtl"
            />
          </div>
        )}
      </div>

      <div className="save-container">
        <button className="save-button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saveStatus && <div className="save-status">{saveStatus}</div>}
      </div>
    </div>
  );
};

export default LanguageEditorPage;
