import React, { useState } from 'react';
import Papa from 'papaparse';
import moment from 'moment';

function App() {
  const [data, setData] = useState(null);
  const [employeeMap, setEmployeeMap] = useState(new Map());

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setData(results.data);

        results.data.forEach((row) => {
          const endDate = row.DateTo === 'NULL' ? moment() : moment(row.DateTo);
          const startDate = moment(row.DateFrom);
          const empId1 = row.EmpID;
          const projectId = row.ProjectID;
          // Iterate through the other records for the project ID to find the other employee that worked on the same project
          results.data.forEach((compRow) => {
            if (compRow.ProjectID === projectId && compRow.EmpID !== empId1) {
              const endDate2 =
                compRow.DateTo === 'NULL' ? moment() : moment(compRow.DateTo);
              const startDate2 = moment(compRow.DateFrom);
              // find the overlap days
              let daysWorked = 0;
              if (startDate < endDate2 && endDate > startDate2) {
                daysWorked =
                  moment
                    .duration(
                      moment
                        .min(endDate, endDate2)
                        .diff(moment.max(startDate, startDate2))
                    )
                    .asDays() / 2;
              }
              const empId2 = compRow.EmpID;
              const employeeIds = [empId1, empId2].sort().join(',');
              if (employeeMap.has(employeeIds)) {
                if (employeeMap.get(employeeIds).has(projectId)) {
                  let existingData = employeeMap.get(employeeIds);
                  existingData.set(
                    projectId,
                    existingData.get(projectId) + daysWorked
                  );
                  employeeMap.set(employeeIds, existingData);
                } else {
                  let existingData = employeeMap.get(employeeIds);
                  existingData.set(projectId, daysWorked);
                  employeeMap.set(employeeIds, existingData);
                }
              } else {
                employeeMap.set(
                  employeeIds,
                  new Map([[projectId, daysWorked]])
                );
              }
            }
          });
        });
      },
    });
    console.log(employeeMap);
  };

  // function to create table
  const createTable = () => {
    let table = [];
    // iterate through employeeMap and create table data
    employeeMap.forEach((projectMap, empIds) => {
      let empIdsArray = empIds.split(',');
      let empId1 = empIdsArray[0];
      let empId2 = empIdsArray[1];
      projectMap.forEach((daysWorked, projectId) => {
        if (daysWorked > 0) {
          table.push(
            <tr key={projectId}>
              <td>{empId1}</td>
              <td>{empId2}</td>
              <td>{projectId}</td>
              <td>{daysWorked}</td>
            </tr>
          );
        }
      });
    });
    return table;
  };

  return (
    <div>
      <input type='file' onChange={handleFileSelect} />
      {data && (
        <table>
          <thead>
            <tr>
              <th>EmpID1</th>
              <th>EmpID2</th>
              <th>ProjectID</th>
              <th>DaysWorked</th>
            </tr>
          </thead>
          <tbody>{createTable()}</tbody>
        </table>
      )}
    </div>
  );
}

export default App;
