import type { NextPage } from "next";
import { Alert, ListGroup, Pagination } from "react-bootstrap";
import { factory } from "../ethereum/contract";
import MysteryCard from "components/MysteryCard";
import { IMysteryPage, IMysteryQuery } from "types";
import { useRouter } from "next/router";
import ReactPaginate from "react-paginate";

const Home: NextPage<{
  mysterys: IMysteryPage;
}> = ({ mysterys }) => {
  const router = useRouter();

  const limit = Number(router.query.limit || 10);
  const total = Number(mysterys.total);

  const totalPage = Math.ceil(total / limit);

  const handlePageChange = ({ selected }) => {
    console.log(selected);
    const offset = selected * limit;
    let query = {};
    if (selected) {
      (query as any).offset = selected * limit
    }
    router.push({
      pathname: router.pathname, query
    })
  }

  return (
    <main>
      <h2 className="text-center">World Of Mystery</h2>
      {mysterys && mysterys.total > 0 ? (
        <>
          <ListGroup>
            {mysterys.mystery.map((mystery) => (
              <MysteryCard
                key={mystery}
                address={mystery}
                as={ListGroup.Item}
              />
            ))}
          </ListGroup>
          <ReactPaginate
            breakLabel="..."
            marginPagesDisplayed={2}
            pageRangeDisplayed={2}
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            breakClassName="page-item"
            breakLinkClassName="page-link"
            containerClassName="pagination justify-content-center mt-2"
            activeClassName="active"
            pageCount={totalPage}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <Alert className="text-center" variant="info">
          No Mystery!
        </Alert>
      )}
    </main>
  );
};

Home.getInitialProps = async ({ query }) => {
  try {
    const data: IMysteryPage = await factory.methods
      .getDeployedMystery(query.offset || 0, query.limit || 10)
      .call();
    return {
      mysterys: {
        total: data.total,
        mystery: data.mystery,
        nextOffset: data.nextOffset // data.nextOffset,
      },
      query,
    };
  } catch (e) {
    console.log(e);
    return {
      mysterys: {
        total: 0,
        nextOffset: 0,
        mystery: [],
      },
      query,
    };
  }
};

export default Home;
