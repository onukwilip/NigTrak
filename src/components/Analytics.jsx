import React, { useEffect, useRef, useState } from "react";
import data from "../data.json";
import { Doughnut, Line } from "react-chartjs-2";
import { CategoryScale } from "chart.js";
import { Chart as ChartJS } from "chart.js/auto";
import css from "../styles/analytics/Analytics.module.scss";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

export const Card = ({ icon, className, header, value, delay }) => {
  const control = useAnimation();
  const [ref, inView] = useInView();
  const variant = {
    initial: { opacity: 0, x: -100 },
    scaled: { opacity: 1, x: 0 },
  };

  useEffect(() => {
    if (inView) {
      control.start("scaled");
    } else {
      control.start("initial");
    }
  }, [control, inView]);

  return (
    <motion.div
      variants={variant}
      initial="initial"
      animate={control}
      className={`${css.card} ${className}`}
      ref={ref}
      transition={{ delay: delay / 30 }}
    >
      <div className={css.body}>
        <i className={`${icon} ${css.icon}`} />
        <div className={css.desc}>
          <em>{header}</em>
          <em>{value}</em>
        </div>
      </div>

      <i className={`fas fa-arrow-right-long ${css.next}`} />
    </motion.div>
  );
};

export const Analytics = () => {
  const [chartData, setChartData] = useState({
    labels: data.analytics?.map((eachData) => eachData.label),
    datasets: [
      {
        label: "Last walkie talkie distributions",
        fill: true,
        lineTension: 0.4,
        backgroundColor: "rgba(144, 238, 144, 0.5)",
        borderWidth: 4,
        borderColor: "darkgreen",
        marginBottom: "20px",
        color: "white",
        data: data.analytics.map((eachData) => eachData.data),
      },
    ],
  });
  const [doughnutData, setDoughnutData] = useState({
    labels: data.doughnut?.map((eachData) => eachData.label),
    datasets: [
      {
        label: "Devices",
        backgroundColor: data.doughnut?.map((eachData) => eachData.color),
        borderWidth: 0,
        color: "white",
        data: data.doughnut.map((eachData) => eachData.data),
      },
    ],
  });

  const lineChartOptions = {
    title: {
      display: true,
      text: "Device distributions for 2022",
      fontSize: "30px",
    },
    legend: {
      display: true,
      position: "right",
    },
  };

  const doughnutChartOptions = {
    title: {
      display: true,
      text: "Device distributions for 2022",
      fontSize: "30px",
    },
    legend: {
      display: true,
      position: "right",
    },
  };

  return (
    <section className={css.analytics}>
      <div className={css.dashboard}>
        <Line
          data={chartData}
          width="auto"
          height="70"
          options={lineChartOptions}
        />
      </div>
      <div className={css["mobile-dashboard"]}>
        <Line
          data={chartData}
          width="auto"
          height="200"
          options={lineChartOptions}
        />
      </div>
      <div className={css.below}>
        <div className={css.container}>
          <div className={css["card-container"]}>
            <Card
              icon="fas fa-walkie-talkie"
              header="Total devices distributed"
              value={10000}
              delay={0}
            />
            <Card
              icon="fas fa-walkie-talkie"
              header="Total devices available"
              value={15000}
              delay={1}
            />
            <Card
              icon="fas fa-walkie-talkie"
              header="Total devices remaining"
              value={5000}
              delay={2}
            />
            <Card
              icon="fas fa-person-military-rifle"
              header="Total soldiers available"
              value={30000}
              delay={3}
            />
            <Card
              icon="fas fa-person-military-rifle"
              header="Total soldiers with device"
              value={5000}
              delay={4}
            />
            <Card
              icon="fa-solid fa-building-circle-exclamation"
              header="Total stations"
              value={200}
              delay={5}
            />
          </div>
          <div className={css["doughnut-chart"]}>
            <Doughnut
              data={doughnutData}
              height="40vh"
              options={doughnutChartOptions}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
