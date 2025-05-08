import React from "react";
import ResourceCategoryManager from "./ResourceCategoryManager";
import FileUploader from "./FileUploader";
import ResourceFileManager from "./ResourceFileManager";

const ResourcesAdmin: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Resources Management</h1>

      <div className="space-y-8">
        <FileUploader />
        <ResourceFileManager />
        <ResourceCategoryManager />
      </div>
    </div>
  );
};

export default ResourcesAdmin;
