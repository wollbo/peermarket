import React from "react";
import DataTable from "react-data-table-component";

const columns = [
  {
    name: "Title",
    selector: (row) => row.title,
    sortable: true,
  },
  {
    name: "Year",
    selector: (row) => row.year,
    sortable: true,
  },
];

const data = [
  {
    id: 1,
    title: "Beetlejuice",
    year: "1988",
  },
  {
    id: 2,
    title: "Ghostbusters",
    year: "1984",
  },
];

function Home() {
  return (
    <div className="container text-center">
          <div className="row d-flex justify-content-center">
            <div className="col-6 align-self-center">
              <h1 class="jumbotron-heading">
                Buy and Sell Ethereum safely with Peermarket!
              </h1>
              <p class="lead text-muted">
                Buy and sell Ethereum using... Guess we want to mention
                chainlink, Tink here
              </p>
              <p>
                <DataTable columns={columns} data={data} />
              </p>
            </div>
        </div>
    </div>
  );
}

export default Home;
