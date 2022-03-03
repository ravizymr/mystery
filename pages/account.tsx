import { factory } from "../ethereum/contract";
import MysteryCard from "components/MysteryCard";
import { useEffect, useState } from "react";
import { Alert, ListGroup, Spinner } from "react-bootstrap";
import { IMysteryPage } from "types";
import { useRouter } from "next/router";
import ReactPaginate from "react-paginate";
import { useStateContext } from "context/state";

const AccountPage = () => {
  const router = useRouter();

  const { account } = useStateContext();
  const [userMystery, setUserMystery] = useState<IMysteryPage>({
    total: 0,
    nextOffset: 0,
    mystery: []
  });
  const [loading, setLoading] = useState(false);

  const limit = Number(router.query.limit || 10);
  const offset = Number(router.query.offset || 0);
  const currentPage = offset / limit

  useEffect(() => {
    const getDetailLatest = async () => {
      if (account) {
        setLoading(true)
        try {
          const data: IMysteryPage = await factory.methods.getMyMystery(offset, limit).call({
            from: account,
          });
          setUserMystery({
            mystery: data.mystery,
            nextOffset: Number(data.nextOffset),
            total: Number(data.total)
          });
        } catch (e) {
          console.log(e);
        } finally {
          setLoading(false)
        }
      }
    };
    getDetailLatest();
  }, [limit, offset, account]);

  const handlePageChange = ({ selected }) => {
    let query = {};
    if (selected) {
      (query as any).offset = selected * limit
    }
    router.push({
      pathname: router.pathname, query
    })
  }

  const getContent = () => {
    if (account) {
      return (
        <h2 className="text-center">
          {account.substr(0, 5) + "...." + account.substr(-5, 5)}
        </h2>
      );
    }
    return <h2>No Account found!</h2>;
  };

  const renderMystery = () => {
    if (loading) {
      return <div className='text-center'><Spinner animation='grow' /></div>
    }
    if (userMystery && userMystery.total > 0) {
      return (<>
        <ListGroup>
          {userMystery.mystery.map((mystery) => (
            <MysteryCard key={mystery.mystery} mystery={mystery} as={ListGroup.Item} />
          ))}
        </ListGroup>
        {userMystery.total > 10 && <ReactPaginate
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
          initialPage={currentPage}
          pageCount={Math.ceil(userMystery.total / limit)}
          onPageChange={handlePageChange}
        />}
      </>
      );
    }
    return account && !loading && <Alert className="text-center" variant={"info"}>
      You Don{"'"}t Have any Mystery.
    </Alert>;
  };
  return (
    <main>
      {getContent()}
      {renderMystery()}
    </main>
  );
};

export default AccountPage;
