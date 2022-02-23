import { factory } from "../ethereum/contract";
import MysteryCard from "components/MysteryCard";
import { useEffect, useState } from "react";
import web3 from "ethereum/web3";
import { Alert, ListGroup } from "react-bootstrap";
import { IMysteryPage } from "types";
import { useRouter } from "next/router";
import ReactPaginate from "react-paginate";

const AccountPage = () => {
  const router = useRouter();

  const [account, setAccount] = useState<string>();
  const [userMystery, setUserMystery] = useState<IMysteryPage>({
    total: 0,
    nextOffset: 0,
    mystery: []
  });
  const [loading, setLoading] = useState(false);

  const limit = Number(router.query.limit || 10);
  const offset = Number(router.query.offset || 0);


  useEffect(() => {
    const getAccount = async () => {
      const [account] = await web3.eth.getAccounts();
      setAccount(account);
      if (account) {
        setLoading(true)
        try {
          const data: IMysteryPage = await factory.methods.getMyMystery(offset, limit).call({
            from: account,
          });
          setUserMystery({
            mystery: data.mystery,
            nextOffset: data.nextOffset,
            total: data.total
          });
        } catch (e) {
          console.log(e);
        } finally {
          setLoading(false)
        }
      }
    };
    getAccount();
  }, [limit, offset]);

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
    if (userMystery.total > 0) {
      return (<>
        <ListGroup>
          {userMystery.mystery.map((mystery) => (
            <MysteryCard key={mystery} address={mystery} as={ListGroup.Item} />
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
          pageCount={Math.ceil(userMystery.total / limit)}
          onPageChange={handlePageChange}
        />
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
