import { LinearProgress } from "@mui/material";
import React from "react";

const Loading = () => {
  return (
    <center>
      <div className="flex flex-col justify-center p-20 h-screen gap-y-4">
        <h1 className="text-4xl font-semibold animate-pulse">NgobrolApp</h1>
        <LinearProgress />
      </div>
    </center>
  );
};

export default Loading;
