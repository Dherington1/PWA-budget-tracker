const router = require("express").Router();
const Transaction = require("../models/transaction.js");

// posting our transaction
router.post("/api/transaction", ({ body }, res) => {
  Transaction.create(body)
    .then((dbTransaction) => {
      res.json(dbTransaction);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});


router.post("/api/transaction/bulk", ({ body }, res) => {
  Transaction.insertMany(body)
    .then((dbTransaction) => {
      res.json(dbTransaction);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});


router.get("/api/transaction", (req, res) => {
  Transaction.find({})
    .sort({ date: -1 })
    .then((dbTransaction) => {
      res.json(dbTransaction);
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});


router.delete("/api/transaction/:id", (req, res) => {

  Transaction
    .findByIdAndRemove(req.params.id)
    .then(doc => {
      if (!doc) {
        return res.status(404);
      }
      return res.status("success")
    })
    .catch(err => next(err));

})


router.delete('/api/transaction/:id', (req, res, next) => {
  Transaction.deleteOne({_id: req.params.id}).then(
    () => {
      res.status(200).json({
        message: 'Deleted!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
});

module.exports = router;