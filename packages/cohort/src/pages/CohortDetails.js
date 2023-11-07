import React from "react";
import {
  Text,
  Box,
  Pressable,
  Image,
  Avatar,
  Stack,
  VStack,
} from "native-base";
import { useTranslation } from "react-i18next";
import {
  capture,
  Layout,
  Tab,
  overrideColorTheme,
  H3,
  IconByName,
  Widget,
  cohortRegistryService,
  Loading
} from "@shiksha/common-lib";
import moment from "moment";
import manifest from "../manifest.json";
import { useParams } from "react-router-dom";

const colors = overrideColorTheme();

// const MyClassRoute = React.lazy(() => import("classes/MyClassRoute"));
// const TimeTableRoute = React.lazy(() => import("calendar/TimeTableRoute"));

const PRESENT = "Present";
const ABSENT = "Absent";
const UNMARKED = "Unmarked";

// const SelfAttendanceSheet = React.lazy(() =>
//   import("profile/SelfAttendanceSheet")
// );

const CohortDetails = ({ footerLinks, setAlert, appName }) => {
  const { t } = useTranslation();
  const [selfAttendance, setSelfAttendance] = React.useState({});
  const [showModal, setShowModal] = React.useState(false);
  const [cohortDetails, setCohortDetails] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  let newAvatar = localStorage.getItem("firstName");
  const { cohortId } = useParams();

  let cameraUrl = "";
  let avatarUrlObject = cameraUrl
    ? {
        source: {
          uri: cameraUrl,
        },
      }
    : {};
  const widgetData = [
    {
      data: [
        {
          title: t("Mark My Attendance"),
          link: "/classes",
          icon: "ParentLineIcon",
          _box: {
            bg: "widgetColor.500",
          },
          _icon: {
            color: "iconColor.500",
          },
          _text: { color: "warmGray.700" },
        },
      ],
    },
    {
      data: [
        {
          title: t("View Students"),
          link: `/cohorts/${cohortId}/students`,
          icon: "ParentLineIcon",
          _box: {
            bg: "widgetColor.600",
          },
          _icon: {
            color: "iconColor.600",
          },
          _text: { color: "warmGray.700" },
        },
      ],
    },
    {
      data: [
        {
          title: t("Class Digital Observation"),
          link: "/classes",
          icon: "ParentLineIcon",
          _box: {
            bg: "widgetColor.700",
          },
          _icon: {
            color: "iconColor.700",
          },
          _text: { color: "warmGray.700" },
        },
      ],
    },
    {
      data: [
        {
          title: t("Class Phygital Assessment"),
          link: "/classes",
          icon: "ParentLineIcon",
          _box: {
            bg: "widgetColor.800",
          },
          _icon: {
            color: "iconColor.800",
          },
          _text: { color: "warmGray.700" },
        },
      ],
    },
    {
      data: [
        {
          title: t("View Class Reports"),
          link: "/classes",
          icon: "ParentLineIcon",
          _box: {
            bg: "widgetColor.1000",
          },
          _icon: {
            color: "iconColor.1000",
          },
          _text: { color: "warmGray.700" },
        },
      ],
    },
  ];

  React.useEffect(() => {
    const getData = async () => {
      const result = await cohortRegistryService.getCohortDetails(
        {
          cohortId: cohortId,
        },
        {
          tenantid: process.env.REACT_APP_TENANT_ID,
        }
      );
      console.log("result", result);

      if (result.length) {
        setCohortDetails(result[0]);
      }
      setLoading(false);
    };
    getData();
    capture("PAGE");
  }, [cohortId]);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <Layout
        _header={{
          title: cohortDetails?.name,
          subHeading: moment().format("hh:mm A"),
          iconComponent: (
            <Pressable onPress={(e) => setShowModal(true)}>
              {cameraUrl ? (
                <Image
                  ref={myRef}
                  {...avatarUrlObject}
                  rounded="lg"
                  alt="Profile"
                  size="50px"
                />
              ) : (
                <Avatar>{newAvatar?.toUpperCase().substr(0, 2)}</Avatar>
              )}
              {selfAttendance?.attendance ? (
                <IconByName
                  name={
                    selfAttendance.attendance === PRESENT &&
                    selfAttendance?.remark !== ""
                      ? "AwardFillIcon"
                      : selfAttendance.attendance === ABSENT
                      ? "CloseCircleFillIcon"
                      : "CheckboxCircleFillIcon"
                  }
                  isDisabled
                  color={
                    selfAttendance.attendance === PRESENT &&
                    selfAttendance?.remark !== ""
                      ? "attendance.special_duty"
                      : selfAttendance.attendance === ABSENT
                      ? "attendance.absent"
                      : "attendance.present"
                  }
                  position="absolute"
                  bottom="-5px"
                  right="-5px"
                  bg="white"
                  rounded="full"
                />
              ) : (
                ""
              )}
            </Pressable>
          ),
        }}
        _appBar={{ languages: manifest.languages }}
        // subHeader={<H3 textTransform="none">{t("THE_CLASS_YOU_TAKE")}</H3>}
        _subHeader={{
          bg: colors?.cardBg,
          _text: {
            fontSize: "16px",
            fontWeight: "600",
            textTransform: "inherit",
          },
        }}
        _footer={footerLinks}
      >
        <VStack space={2}>
          {widgetData.map((item, index) => {
            return <Widget {...item} key={index} />;
          })}
        </VStack>
      </Layout>
    );
  }
};

export default CohortDetails;
