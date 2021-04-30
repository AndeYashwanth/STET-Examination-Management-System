import React, { lazy,useState, useEffect  } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CProgress,
  CRow
} from '@coreui/react'
import {CChartPie} from '@coreui/react-chartjs'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"  
import Loader from 'react-loader-spinner'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
const { ServerPORT } = require('../newports');
const uri = "http://localhost:"+ServerPORT;
const WidgetsDropdown = lazy(() => import('../widgets/WidgetsDropdown.js'))
console.log(uri);
const Dashboard = () => {
  const [Stats, setStats] = useState({});
  const [isBusy, setBusy] = useState(true)
  async function fetchData() {
    if(isBusy===true)
    {
      let headers = new Headers();

      headers.append('Accept', 'application/json');
      //
      const res = await axios(uri+"/stats/", {
          mode: 'cors',
          method: 'GET',
          headers: headers
      })
      setStats(res.data)
      console.log(Stats.stats)
      setBusy(false)
    }
  }

  useEffect(() => {
    fetchData();
    console.log(Stats.sex);
  }); 


  return (
      <div>
        {isBusy ? (
                  <Loader
                    type="Circles"
                    color="#00BFFF"
                    height={100}
                    width={100}
                    
                  />
                ) : (
                 <>   
                <WidgetsDropdown
                    stats = {Stats}
                />

                <CRow>
                  <CCol>
                    <CCard>
                      <CCardHeader>
                        Stats
                      </CCardHeader>
                      <CCardBody>
                        <CRow>
                          <CCol xs="12" md="6" xl="6">
                            <div className="progress-group mb-4">
                              <div className="progress-group-header">
                                <CIcon className="progress-group-icon" name="cil-user" />
                                <span className="title">Male</span>
                                    <span className="ml-auto font-weight-bold">{(Stats.Gender.Male/Stats.registerd)*100}%</span>
                              </div>
                              <div className="progress-group-bars">
                                <CProgress className="progress-xs" color="warning" value={(Stats.Gender.Male/Stats.registerd)*100} />
                              </div>
                            </div>
                            <div className="progress-group mb-5">
                              <div className="progress-group-header">
                                <CIcon className="progress-group-icon" name="cil-user-female" />
                                <span className="title">Female</span>
                                <span className="ml-auto font-weight-bold">{(Stats.Gender.Female/Stats.registerd)*100}%</span>
                              </div>
                              <div className="progress-group-bars">
                                <CProgress className="progress-xs" color="warning" value={(Stats.Gender.Female/Stats.registerd)*100} />
                              </div>
                            </div>
                            <div className="progress-group mb-5">
                              <div className="progress-group-header">
                                <CIcon className="progress-group-icon" name="cil-user-male" />
                                <span className="title">Others</span>
                                <span className="ml-auto font-weight-bold">{(Stats.Gender.Others/Stats.registerd)*100}%</span>
                              </div>
                              <div className="progress-group-bars">
                                <CProgress className="progress-xs" color="warning" value={(Stats.Gender.Others/Stats.registerd)*100} />
                              </div>
                            </div>


                            <div className="progress-group">
                              <div className="progress-group-header">
                                <CIcon className="progress-group-icon" name="cil-chevron-right" />
                                <span className="title">General</span>
                                <span className="ml-auto font-weight-bold">{(Stats.Category.general)}<span className="text-muted small">({(Stats.Category.general/Stats.registerd)*100}%)</span></span>
                              </div>
                              <div className="progress-group-bars">
                                <CProgress className="progress-xs" color="success" value={(Stats.Category.general/Stats.registerd)*100} />
                              </div>
                            </div>
          
          
                            <div className="progress-group">
                              <div className="progress-group-header">
                                <CIcon name="cil-chevron-right" className="progress-group-icon" />
                                <span className="title">OBC</span>
                                <span className="ml-auto font-weight-bold">{(Stats.Category.obc)} <span className="text-muted small">({(Stats.Category.obc/Stats.registerd)*100}%)</span></span>
                              </div>
                              <div className="progress-group-bars">
                                <CProgress className="progress-xs" color="success" value={(Stats.Category.obc/Stats.registerd)*100}/>
                              </div>
                            </div>
                            <div className="progress-group">
                              <div className="progress-group-header">
                                <CIcon name="cil-chevron-right" className="progress-group-icon" />
                                <span className="title">SC</span>
                                <span className="ml-auto font-weight-bold">{(Stats.Category.sc)*100} <span className="text-muted small">({(Stats.Category.sc/Stats.registerd)*100}%)</span></span>
                              </div>
                              <div className="progress-group-bars">
                                <CProgress className="progress-xs" color="success" value={(Stats.Category.sc/Stats.registerd)*100} />
                              </div>
                            </div>
                            <div className="progress-group">
                              <div className="progress-group-header">
                                <CIcon name="cil-chevron-right" className="progress-group-icon" />
                                <span className="title">ST</span>
                                <span className="ml-auto font-weight-bold">{(Stats.Category.st)}<span className="text-muted small">({(Stats.Category.st/Stats.registerd)*100}%)</span></span>
                              </div>
                              <div className="progress-group-bars">
                                <CProgress className="progress-xs" color="success" value={(Stats.Category.st/Stats.registerd)*100} />
                              </div>
                            </div>
                          </CCol>
                          <CCol>
                              <CCard>
                              <CCardHeader>
                                Exam Type
                              </CCardHeader>
                              <CCardBody>
                                <CChartPie
                                  type="pie"
                                  datasets={[
                                    {
                                      backgroundColor: [
                                        '#41B883',
                                        '#E46651',
                                        '#00D8FF'
                                      ],
                                      data: [(Stats.Exam.primary),(Stats.Exam.gtart),(Stats.Exam.gtscience)]
                                    }
                                  ]}
                                  labels={["Primary","GT Art","GT Science"]}
                                  options={{
                                    tooltips: {
                                      enabled: true
                                    }
                                  }}
                                />
                              </CCardBody>
                            </CCard>
                          <br />
                          </CCol>
                        </CRow>
                      </CCardBody>
                    </CCard>
                  </CCol>
                </CRow>
               </>
                )          
        }
      </div>
  )
}

export default Dashboard
