import React, { useState, useRef } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import range from "lodash.range";
import {
  convertSolar2Lunar,
  getTypeCurrentYear,
} from "@src/constants/formula-lunar";
import useOnClickOutside from "./useOnClickOutside";

const weekDays = [
  { key: 8, value: "CN" },
  { key: 2, value: "T2" },
  { key: 3, value: "T3" },
  { key: 4, value: "T4" },
  { key: 5, value: "T5" },
  { key: 6, value: "T6" },
  { key: 7, value: "T7" },
];
const listMonth = [
  { key: 1, value: "Tháng 1" },
  { key: 2, value: "Tháng 2" },
  { key: 3, value: "Tháng 3" },
  { key: 4, value: "Tháng 4" },
  { key: 5, value: "Tháng 5" },
  { key: 6, value: "Tháng 6" },
  { key: 7, value: "Tháng 7" },
  { key: 8, value: "Tháng 8" },
  { key: 9, value: "Tháng 9" },
  { key: 10, value: "Tháng 10" },
  { key: 11, value: "Tháng 11" },
  { key: 12, value: "Tháng 12" },
];
const listYear = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
];

interface CalendarProps {
  value: string; // format is YYYY-MM-DD
  change: (value: string) => void;
  hideLunar?: boolean; // hide or show lunar
  showTooltip?: boolean;
  placeHolder: string;
  remove: () => void;
  isValidate?: boolean;
  isShowRequireIcon?: boolean;
}

const CalendarLunar: React.FC<CalendarProps> = (props) => {
  const {
    value,
    change,
    hideLunar,
    showTooltip,
    placeHolder,
    remove,
    isValidate,
    isShowRequireIcon,
  } = props;
  const [dayObj, setDayObj] = useState(
    value && value.length ? dayjs(value, "YYYY-M-D") : dayjs(),
  );
  const [todayObj, setTodayObj] = useState(
    value && value.length ? dayjs(value, "YYYY-M-D") : dayjs(),
  );

  const [visible, setVisible] = useState(false);

  const [mode, setMode] = useState("day"); // mode: day || month || year
  const [subadd, setSubAddYear] = useState(0);

  const ref = useRef(null);

  const thisYear = dayObj.year();
  const thisMonth = dayObj.month(); // (January as 0, December as 11)
  const daysInMonth = dayObj.daysInMonth();

  const dayObjOf1 = dayjs(`${thisYear}-${thisMonth + 1}-1`);
  const weekDayOf1 = dayObjOf1.day(); // (Sunday as 0, Saturday as 6)

  const dayObjOfLast = dayjs(`${thisYear}-${thisMonth + 1}-${daysInMonth}`);
  const weekDayOfLast = dayObjOfLast.day();

  const handlePrev = () => {
    if (mode === "day") {
      setDayObj(dayObj.subtract(1, "month"));
    } else if (mode === "year") {
      setSubAddYear(subadd - 1);
    }
  };

  const handleNext = () => {
    if (mode === "day") {
      setDayObj(dayObj.add(1, "month"));
    } else if (mode === "year") {
      setSubAddYear(subadd + 1);
    }
  };

  const convertLunar = (d: unknown, y: unknown, m: unknown) => {
    const test = convertSolar2Lunar(d, m, y, 7);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { lunarDay, lunarMonth, lunarYear } = test;
    return lunarDay === 1 ? `${lunarDay}/${lunarMonth}` : `${lunarDay}`;
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const formatTimeTitle = (dayObj: Dayjs, mode: string) => {
    const month = dayObj.format("M");
    const year = dayObj.format("YYYY");
    if (mode === "year" || mode === "month") {
      return (
        <div>
          <span onClick={() => setMode("year")}>{year}</span>
        </div>
      );
    }
    return (
      <div>
        <span onClick={() => setMode("month")}>Tháng {month} </span>
        <span onClick={() => setMode("year")}>{year}</span>
      </div>
    );
  };

  const checkActiveCurrentTime = (
    day: unknown,
    month: unknown,
    year: unknown,
    todayObject: Dayjs,
  ) => {
    return day === todayObject.date() &&
      month === todayObject.month() &&
      year === todayObject.year()
      ? " day-cell--today"
      : "";
  };
  const chooseCurrentTime = (
    d: number,
    m: number,
    y: number,
    isCurrent: unknown,
  ) => {
    setTodayObj(dayjs(`${y}-${m}-${d}`, "YYYY-M-D"));

    // props function pass value into parent
    change(`${y}-${m}-${d}`);

    if (isCurrent === 1) {
      setDayObj(dayObj.add(1, "month"));
    } else if (isCurrent === -1) {
      setDayObj(dayObj.subtract(1, "month"));
    }

    setVisible(false);
  };
  const formatValueByVietnamese = (
    data: string,
    tooltip: unknown,
    isInput: boolean,
  ) => {
    if (data && data.length) {
      const d = +dayjs(data, "YYYY/M/D").format("D");
      const m = +dayjs(data, "YYYY/M/D").format("M");
      const y = +dayjs(data, "YYYY/M/D").format("YYYY");

      const { lunarDay, lunarMonth } = convertSolar2Lunar(d, m, y, 7);

      if (isInput) {
        const values = dayjs(data, "YYYY/MM/DD").format("D/M/YYYY");
        return tooltip
          ? values
          : values + " nhằm ngày " + lunarDay + "/" + lunarMonth + " âm lịch";
      }

      if (tooltip) {
        return "nhằm ngày " + lunarDay + "/" + lunarMonth + " âm lịch";
      }
    }
    return "";
  };

  const handleFocusInput = () => {
    setVisible(!visible);
  };

  const handleClickOutside = () => {
    if (visible) {
      setSubAddYear(0);
      setMode("day");
      setVisible(false);
      setDayObj(value && value.length ? dayjs(value, "YYYY-M-D") : dayjs());
    }
  };

  useOnClickOutside(ref, handleClickOutside);

  const handleClickMonth = (month: number) => {
    const day = dayObj.format("DD");
    const year = dayObj.format("YYYY");
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const value = `${year}-${month}-${day}`;
    setDayObj(dayjs(value, "YYYY-MM-DD"));
    setMode("day");
    setSubAddYear(0);
  };
  const handleClickYear = (year: number) => {
    const day = dayObj.format("DD");
    const month = dayObj.format("MM");
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const value = `${year}-${month}-${day}`;
    setDayObj(dayjs(value, "YYYY-MM-DD"));
    setMode("month");
    setSubAddYear(0);
  };
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const renderYear = (time: Dayjs, subadd: number) => {
    const year = +time.format("YYYY");
    const subYear = `${year}`.substring(0, 2); // 1999 -> 19, 2010 -> 20
    const type = getTypeCurrentYear(year);
    const listYearCustom = listYear.map((item) => {
      let yearWith2 = `${item + type * 20}`;
      if (yearWith2.length === 1) {
        yearWith2 = "0" + yearWith2;
      }
      let fullYear = +`${subYear + yearWith2}`;
      fullYear = fullYear + subadd * 20;
      return fullYear;
    });
    return listYearCustom;
  };
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const formatTimeTitleYear = (listYear: Array<number>) => {
    if (listYear && listYear.length) {
      return `${listYear[0] + " - " + listYear[listYear.length - 1]}`;
    }
    return "";
  };
  const removeDate = () => {
    remove();
  };

  return (
    <>
      <div
        ref={ref}
        className={`input-container input-text-group calendar ${
          isValidate && value === "" && "invalid-calendar"
        }`}
      >
        <div className="tooltipcus">
          {isValidate && value === "" && (
            <span className="mess--warning invalid-calendar-message">
              Không để trống trường này
            </span>
          )}
          <div className="form__group">
            {isShowRequireIcon && (
              <span className="calendar-require-input-icon">*</span>
            )}
            <input
              className={`calendar-i form-input input-text-group ${
                isValidate && value === "" && "invalid-calendar-input"
              }`}
              value={formatValueByVietnamese(value, showTooltip, true)}
              readOnly
              onClick={handleFocusInput}
              placeholder={placeHolder}
            />
          </div>
          {value && value.length && (
            <i className="icon icon-delete i-remove" onClick={removeDate} />
          )}
          {showTooltip && value && value.length && (
            <span className="tooltipcustext">
              {formatValueByVietnamese(value, showTooltip, false)}
            </span>
          )}
        </div>

        <div className={`${visible ? "picker-show" : "picker-hide"}`}>
          <div className="header-c">
            {mode !== "month" && (
              <button type="button" className="nav-btn" onClick={handlePrev}>
                {"<"}
              </button>
            )}
            {mode === "year" ? (
              <div className="datetime">
                {formatTimeTitleYear(renderYear(dayObj, subadd))}
              </div>
            ) : (
              <div className="datetime">{formatTimeTitle(dayObj, mode)}</div>
            )}
            {mode !== "month" && (
              <button type="button" className="nav-btn" onClick={handleNext}>
                {">"}
              </button>
            )}
          </div>
          {mode === "day" && (
            <div className="body-c">
              <div className="week-container">
                {weekDays.map((d) => (
                  <div className="week-cell bold" key={d.key}>
                    {d.value}
                  </div>
                ))}
              </div>
              <div className="day-container">
                {range(weekDayOf1).map((i) => (
                  <div
                    className="day-cell day-cell--faded"
                    key={i}
                    onClick={() =>
                      chooseCurrentTime(
                        dayObjOf1.subtract(weekDayOf1 - i, "day").date(),
                        thisMonth,
                        thisYear,
                        -1,
                      )
                    }
                  >
                    {dayObjOf1.subtract(weekDayOf1 - i, "day").date()}

                    {!hideLunar && (
                      <span className="text-lunar">
                        {convertLunar(
                          dayObjOf1.subtract(weekDayOf1 - i, "day").date(),
                          thisYear,
                          thisMonth,
                        )}
                      </span>
                    )}
                  </div>
                ))}

                {range(daysInMonth).map((i) => (
                  <div
                    className={`day-cell ${checkActiveCurrentTime(
                      i + 1,
                      thisMonth,
                      thisYear,
                      todayObj,
                    )}`}
                    key={i}
                    onClick={() =>
                      chooseCurrentTime(i + 1, thisMonth + 1, thisYear, 0)
                    }
                  >
                    <span className="text-main">{i + 1}</span>

                    {!hideLunar && (
                      <span className="text-lunar">
                        {convertLunar(i + 1, thisYear, thisMonth + 1)}
                      </span>
                    )}
                  </div>
                ))}

                {range(6 - weekDayOfLast).map((i) => (
                  <div
                    className="day-cell day-cell--faded"
                    key={i}
                    onClick={() =>
                      chooseCurrentTime(
                        dayObjOfLast.add(i + 1, "day").date(),
                        thisMonth + 2,
                        thisYear,
                        1,
                      )
                    }
                  >
                    <span className="text-main">
                      {dayObjOfLast.add(i + 1, "day").date()}
                    </span>

                    {!hideLunar && (
                      <span className="text-lunar">
                        {convertLunar(
                          dayObjOfLast.add(i + 1, "day").date(),
                          thisYear,
                          thisMonth + 2,
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {mode === "month" && (
            <div className="body-c list-custome">
              <div className="columns">
                {listMonth.map((m) => (
                  <div
                    className="column col-4 list-custome_block-m"
                    key={m.key}
                    onClick={() => handleClickMonth(m.key)}
                  >
                    {m.value}
                  </div>
                ))}
              </div>
            </div>
          )}
          {mode === "year" && (
            <div className="body-c list-custome">
              <div className="columns">
                {renderYear(dayObj, subadd).map((y) => (
                  <div
                    className="column col-3 list-custome_block-y"
                    key={y}
                    onClick={() => handleClickYear(y)}
                  >
                    {y}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default CalendarLunar;
