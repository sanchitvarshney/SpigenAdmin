import React from "react";
import { Drawer, Typography } from "antd";
import SelectEndPoint from "@/components/reusable/SelectEndPoint";

const HelpAndSupportModel: React.FC<any> = ({ helpModel, setHelpModel }) => {
  console.log(helpModel, "helpModel");
  return (
    <>
      <Drawer
        title="Spigen Settings"
        open={helpModel}
        onClose={() => setHelpModel(false)}
      >
        <Typography.Title level={5}>Add Custom URL</Typography.Title>
        <SelectEndPoint />
      </Drawer>
    </>
  );
};

export default HelpAndSupportModel;
