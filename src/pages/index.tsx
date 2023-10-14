import TeqCalendarContainer from "@src/components/CalendarContainer";
import dayjs from "dayjs";
import { useState } from "react";

export default function Home() {
  const [value, setValue] = useState(dayjs().format("YYYY/MM/DD"));
  return (
    <div>
      <TeqCalendarContainer
        value={value}
        showTooltip
        placeHolder={"Ngày sinh"}
        change={(data: string) => setValue(data)}
        remove={() => setValue("")}
        isShowRequireIcon
      />
    </div>
  );
}
