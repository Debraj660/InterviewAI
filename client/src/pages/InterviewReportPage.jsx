import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";
import { serverURL } from '../App';
import Step3Report from '../components/Step3Report';

const InterviewReportPage = () => {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setReport(null); 

        const result = await axios.get(
          `${serverURL}/api/interview/report/${id}`,
          { withCredentials: true }
        );
        console.log(result.data);
        setReport(result.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className='text-gray-500 text-lg'>Loading Report...</p>
      </div>
    );
  }

  if (!report || Object.keys(report).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className='text-red-500 text-lg'>Report not found</p>
      </div>
    );
  }

  return <Step3Report report={report} />;
};

export default InterviewReportPage;