import type { NextPage } from "next";
import { Alert, ListGroup } from "react-bootstrap";
import { factory } from "../ethereum/contract";
import MysteryCard from "components/MysteryCard";
import { IMysteryPage } from "types";
import { useRouter } from "next/router";
import ReactPaginate from "react-paginate";

const Home: NextPage<{
  mysterys: IMysteryPage;
}> = ({ mysterys }) => {
  const router = useRouter();

  const limit = Number(router.query.limit || 10);
  const offset = Number(router.query.offset || 0);
  const total = Number(mysterys.total);

  const totalPage = Math.ceil(total / limit);
  const currentPage = offset / limit;

  const handlePageChange = ({ selected }) => {
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
                key={mystery.mystery}
                mystery={mystery}
                as={ListGroup.Item}
              />
            ))}
          </ListGroup>
          {totalPage > 1 && <ReactPaginate
            breakLabel="..."
            initialPage={currentPage}
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
          />}
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
        mystery: data.mystery.map(m => ({ ...m })),
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
