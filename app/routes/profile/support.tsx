import React from "react";
import { FAQComponent } from "../faq";

const Support: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 bg-white rounded-lg shadow p-6">
      <FAQComponent embedded />
    </div>
  );
};

export default Support;
