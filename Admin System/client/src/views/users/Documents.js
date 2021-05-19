import React, { useState, useEffect } from "react";
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDataTable,
  CRow,
  CPagination,
  CButton,
  CImg,
  CModal,
  CMediaBody,
  CModalHeader,
  CModalFooter,
  CModalTitle,
  CModalBody,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import axios from "axios";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";

const { ServerPORT } = require("../newports");
const uri = "http://localhost:" + ServerPORT;
const Documents = ({ match }) => {
  const [documents, setData] = useState({});
  const [userDetails, setUserDetails] = useState({});
  const [isBusy, setBusy] = useState(true);
  const [modalState, setModalState] = useState(false);
  //http://localhost:8081
  const url = uri + "/documentnames/";
  const userDetailsUrl = uri + "/alldetails/" + match.params.id;
  const userDocumentMapping = {
    "Birth Certificate": "DOB",
    "Community Certificate": "Community",
    "Aadhar Card": "Aadhar",
    "Tenth Memo": "Tenth Percentage",
    "Twelfth Memo": "Twelfth Percentage",
    "B.Ed Certificate": "B.Ed Percentage",
    "B.Sc BA Certificate": "B.Ed Percentage"
  }
  async function fetchData() {
    if (isBusy) {
      let headers = new Headers();

      headers.append("Content-Type", "application/json");
      headers.append("Accept", "application/json");

      const res = await axios(url, {
        mode: "cors",
        method: "GET",
        headers: headers,
      });
      setData(res.data);
      setModalState(
        Object.assign({}, ...res.data.map((k) => ({ [k]: false })))
      );
      const userDetailsRes = await axios(userDetailsUrl, {
        mode: "cors",
        method: "GET",
        headers: headers,
      });
      console.log(userDetailsRes.data)
      setUserDetails(userDetailsRes.data)
      setBusy(false);
    }
  }
  async function buttonClicked(buttonName) {
    await axios.post(uri + "/registered/user/" + match.params.id, { "isRejected": buttonName == "reject" ? true : false })
  }

  useEffect(() => {
    fetchData();
  }, []);

  const toggleModal = (key) => {
    //   console.log(key)
    setModalState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  return (
    <>
    <CRow>
      <CCol xl={12}>
        <CCard>
          <CCardHeader>
            User ID: <b>{match.params.id}</b>
          </CCardHeader>
          <CCardBody>
            {isBusy ? (
              <Loader type="Circles" color="#00BFFF" height={100} width={100} />
            ) : (
              <CDataTable
                items={documents}
                fields={[
                  { key: "Document Name", _classes: "font-weight-bold" },
                  "Preview",
                  "View Document",
                  "User Details"
                ]}
                hover
                striped
                scopedSlots={{
                  Preview: (item) => (
                    <td>
                      <CImg
                        src={uri + `/document/${item}/user/${match.params.id}`}
                        thumbnail
                      />
                    </td>
                  ),
                  "Document Name": (item) => <td>{item}</td>,
                  "View Document": (item) => (
                    <td>
                      <CButton
                        color="primary"
                        onClick={() => {
                          toggleModal(item);
                        }}
                        className="m-2"
                      >
                        View {item}
                      </CButton>
                      <CModal
                        show={modalState[item]}
                        onClose={() => {
                          toggleModal(item);
                        }}
                      >
                        <CModalHeader closeButton>{item}</CModalHeader>
                        <CModalBody>
                          <CImg
                            src={
                              uri + `/document/${item}/user/${match.params.id}`
                            }
                            fluidGrow
                          />
                        </CModalBody>
                        <CModalFooter>
                          {/* <CButton color="secondary" onClick={()=>{toggleModal(item)}}>Close</CButton> */}
                        </CModalFooter>
                      </CModal>
                    </td>
                  ),
                  "User Details": (item) => (
                    <td>
                      {userDetails[userDocumentMapping[item]]}
                    </td>
                  )
                }}
              />
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <CButton component="a" color="success" role="button"  onClick={() => { buttonClicked("accept"); }}>Accept</CButton>
    <CButton component="a" color="danger" role="button" onClick={() => { buttonClicked("reject"); }}>Reject</CButton>
    </>
  );
};

export default Documents;
