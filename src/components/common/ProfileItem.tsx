import React from "react";

interface ProfileItemProps {
  label: string;
  value: string | number;
}

const ProfileItem: React.FC<ProfileItemProps> = ({ label, value }) => {
  return (
    <div className="flex flex-col border-b border-[#e6e0d6] py-5 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="mb-1 w-32 text-sm font-medium text-[#7b8385] sm:mb-0">
        {label}
      </span>

      <span className="font-semibold text-[#20252b]">
        {value}
      </span>
    </div>
  );
};

export default ProfileItem;